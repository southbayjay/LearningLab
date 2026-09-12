// Cloudflare Pages API Route for Worksheet Generation
// Updated: 2025-06-09 - Force deployment with new API key
import { OpenAI } from 'openai';

const OPENAI_CONFIG = {
  model: "gpt-5-mini",
  systemMessage: "You are an expert educator specializing in creating engaging, age-appropriate reading materials. Always respond with properly formatted JSON."
};

// Mirrors server/src/middleware/validation.ts so the serverless path enforces
// the same constraints as the Express server before user input reaches OpenAI.
const VALID_GRADE_LEVELS = [
  'k', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12',
  'kindergarten',
  '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th',
  'elementary', 'middle school', 'high school',
];

const INAPPROPRIATE_WORDS = [
  'violence', 'weapon', 'drug', 'alcohol', 'sex', 'sexual', 'porn', 'adult',
  'hate', 'racism', 'terrorist', 'bomb', 'kill', 'death', 'suicide',
  'gambling', 'casino', 'bet', 'political', 'religion', 'religious',
];

function validateWorksheetRequest({ gradeLevel, topic, complexity }) {
  if (typeof gradeLevel !== 'string' || gradeLevel.length < 1 || gradeLevel.length > 20) {
    return 'gradeLevel must be a string of 1-20 characters';
  }
  const normalizedGrade = gradeLevel.toLowerCase().trim().replace(/\s+grade$/, '');
  if (!VALID_GRADE_LEVELS.includes(normalizedGrade)) {
    return 'Invalid grade level. Please use K-12, Kindergarten-12th, Elementary, Middle School, or High School.';
  }
  if (typeof topic !== 'string' || topic.trim().length < 3 || topic.length > 100) {
    return 'topic must be a string of 3-100 characters';
  }
  const lowerTopic = topic.toLowerCase();
  if (INAPPROPRIATE_WORDS.some(word => lowerTopic.includes(word))) {
    return 'Topic contains inappropriate content. Please choose an educational topic suitable for students.';
  }
  if (/(.)\1{4,}/.test(topic)) {
    return 'Topic appears to contain spam-like content.';
  }
  if (complexity !== undefined && !['easy', 'medium', 'hard'].includes(complexity)) {
    return "complexity must be one of 'easy', 'medium', or 'hard'";
  }
  return null;
}

async function generateWorksheetContent(gradeLevel, topic, complexity = 'medium', apiKey) {
  const openai = new OpenAI({
    apiKey: apiKey
  });

  const prompt = `Create an age-appropriate reading comprehension passage and questions for ${gradeLevel} grade students about ${topic}. 
    Difficulty level: ${complexity}. 
    Include:
    1. A title
    2. A passage (250-400 words)
    3. 5 multiple-choice questions
    4. 2 short-answer questions
    5. Answer key
    Format the response in JSON with the following structure:
    {
      "title": "string",
      "passage": "string",
      "multipleChoice": [
        {
          "question": "string",
          "options": ["string", "string", "string", "string"],
          "answer": "string"
        }
      ],
      "shortAnswer": [
        {
          "question": "string",
          "answer": "string"
        }
      ]
    }`;

  const completion = await openai.chat.completions.create({
    model: OPENAI_CONFIG.model,
    messages: [
      {
        role: "system",
        content: OPENAI_CONFIG.systemMessage
      },
      {
        role: "user",
        content: prompt
      }
    ],
    response_format: { type: "json_object" }
  });

  const content = completion.choices[0].message.content;
  if (!content) {
    throw new Error('OpenAI returned empty content');
  }
  
  return JSON.parse(content);
}

// Same-origin requests are always allowed. Additional origins (e.g. a separate
// marketing site embedding the app) can be allow-listed via the
// ALLOWED_ORIGINS environment variable as a comma-separated list.
function resolveAllowedOrigin(request, env) {
  const origin = request.headers.get('Origin');
  if (!origin) return null;
  const selfOrigin = new URL(request.url).origin;
  const allowList = (env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);
  return origin === selfOrigin || allowList.includes(origin) ? origin : null;
}

function corsHeaders(allowedOrigin) {
  const headers = { Vary: 'Origin' };
  if (allowedOrigin) {
    headers['Access-Control-Allow-Origin'] = allowedOrigin;
    headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
    headers['Access-Control-Allow-Headers'] = 'Content-Type';
    headers['Access-Control-Max-Age'] = '86400';
  }
  return headers;
}

function jsonResponse(body, status, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

// Mirrors worksheetRateLimit in server/src/middleware/rateLimiting.ts.
// Counters live in the RATE_LIMIT_KV namespace (fixed window per client IP).
// KV is eventually consistent, so the limit is approximate rather than exact;
// it is a cost-abuse guard, not a hard quota. When the binding is missing the
// check is skipped so a misconfigured deployment degrades to "unlimited"
// rather than "down" (a warning is logged on every request).
const RATE_LIMIT = { windowSeconds: 60 * 60, max: 10 };

async function checkRateLimit(context) {
  const { request, env } = context;
  const kv = env.RATE_LIMIT_KV;
  if (!kv) {
    console.warn('RATE_LIMIT_KV binding not configured; rate limiting disabled');
    return { limited: false, headers: {} };
  }

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const nowSeconds = Math.floor(Date.now() / 1000);
  const windowStart = nowSeconds - (nowSeconds % RATE_LIMIT.windowSeconds);
  const resetIn = windowStart + RATE_LIMIT.windowSeconds - nowSeconds;
  const key = `rl:worksheet:${ip}:${windowStart}`;

  try {
    const count = Number(await kv.get(key)) || 0;
    const headers = {
      'RateLimit-Limit': String(RATE_LIMIT.max),
      'RateLimit-Remaining': String(Math.max(0, RATE_LIMIT.max - count - 1)),
      'RateLimit-Reset': String(resetIn),
    };
    if (count >= RATE_LIMIT.max) {
      headers['RateLimit-Remaining'] = '0';
      headers['Retry-After'] = String(resetIn);
      return { limited: true, headers };
    }
    // expirationTtl must be >= 60s; pad so the key outlives its window.
    context.waitUntil(
      kv.put(key, String(count + 1), { expirationTtl: RATE_LIMIT.windowSeconds + 60 })
    );
    return { limited: false, headers };
  } catch (error) {
    console.error('Rate limit check failed; allowing request:', error);
    return { limited: false, headers: {} };
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;

  const allowedOrigin = resolveAllowedOrigin(request, env);
  const cors = corsHeaders(allowedOrigin);

  if (request.headers.get('Origin') && !allowedOrigin) {
    return jsonResponse({ error: 'Origin not allowed' }, 403, cors);
  }

  const rateLimit = await checkRateLimit(context);
  const baseHeaders = { ...cors, ...rateLimit.headers };
  if (rateLimit.limited) {
    return jsonResponse(
      {
        error: 'Too many worksheet requests',
        message: `You have exceeded the rate limit of ${RATE_LIMIT.max} worksheets per hour. Please try again later.`,
        retryAfter: '1 hour',
      },
      429,
      baseHeaders
    );
  }

  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ error: 'Invalid request data', details: 'Body must be JSON' }, 400, baseHeaders);
    }
    const { gradeLevel, topic, complexity = 'medium' } = body ?? {};

    console.log('Generating worksheet for:', { gradeLevel, topic, complexity });

    if (!gradeLevel || !topic) {
      return jsonResponse(
        { error: 'Missing required fields', details: 'gradeLevel and topic are required' },
        400,
        baseHeaders
      );
    }

    const validationError = validateWorksheetRequest({ gradeLevel, topic, complexity });
    if (validationError) {
      return jsonResponse({ error: 'Invalid request data', details: validationError }, 400, baseHeaders);
    }

    if (!env.OPENAI_API_KEY) {
      console.error('OpenAI API key not configured');
      return jsonResponse(
        {
          error: 'Configuration error',
          details: 'The worksheet service is not configured. Please contact support.',
        },
        500,
        baseHeaders
      );
    }

    const worksheet = await generateWorksheetContent(gradeLevel, topic, complexity, env.OPENAI_API_KEY);
    return jsonResponse(worksheet, 200, baseHeaders);
  } catch (error) {
    // Upstream errors can embed provider details and partially masked API keys,
    // so they are logged server-side and never forwarded to the client.
    console.error('Error generating worksheet:', error);
    return jsonResponse(
      {
        error: 'Failed to generate worksheet',
        details: 'Please try again. If the problem persists, contact support.',
      },
      500,
      baseHeaders
    );
  }
}

// CORS preflight
export async function onRequestOptions(context) {
  const { request, env } = context;
  const allowedOrigin = resolveAllowedOrigin(request, env);
  return new Response(null, {
    status: request.headers.get('Origin') && !allowedOrigin ? 403 : 204,
    headers: corsHeaders(allowedOrigin),
  });
}
