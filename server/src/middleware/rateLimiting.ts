import { rateLimit } from 'express-rate-limit';
import { slowDown } from 'express-slow-down';

const envInt = (name: string, fallback: number): number => {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer, got "${raw}"`);
  }
  return value;
};

export const WORKSHEET_RATE_LIMIT_WINDOW_MS = envInt(
  'WORKSHEET_RATE_LIMIT_WINDOW_MS',
  60 * 60 * 1000
);
export const WORKSHEET_RATE_LIMIT_MAX_REQUESTS = envInt('WORKSHEET_RATE_LIMIT_MAX_REQUESTS', 10);
export const GENERAL_RATE_LIMIT_WINDOW_MS = envInt('GENERAL_RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000);
export const GENERAL_RATE_LIMIT_MAX_REQUESTS = envInt('GENERAL_RATE_LIMIT_MAX_REQUESTS', 100);

const describeWindow = (ms: number): string => {
  if (ms % (60 * 60 * 1000) === 0) {
    const h = ms / (60 * 60 * 1000);
    return `${h} hour${h === 1 ? '' : 's'}`;
  }
  if (ms % (60 * 1000) === 0) return `${ms / (60 * 1000)} minutes`;
  return `${Math.ceil(ms / 1000)} seconds`;
};

// Strict rate limiting for worksheet generation (most expensive operation)
export const worksheetRateLimit = rateLimit({
  windowMs: WORKSHEET_RATE_LIMIT_WINDOW_MS,
  max: WORKSHEET_RATE_LIMIT_MAX_REQUESTS,
  message: {
    error: 'Too many worksheet requests',
    message: `You have exceeded the rate limit of ${WORKSHEET_RATE_LIMIT_MAX_REQUESTS} worksheets per ${describeWindow(WORKSHEET_RATE_LIMIT_WINDOW_MS)}. Please try again later.`,
    retryAfter: describeWindow(WORKSHEET_RATE_LIMIT_WINDOW_MS),
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Progressive delay for worksheet requests to discourage rapid requests
export const worksheetSlowDown = slowDown({
  windowMs: WORKSHEET_RATE_LIMIT_WINDOW_MS,
  delayAfter: 3, // Allow 3 requests per hour at full speed
  delayMs: hits => hits * 2000, // Add 2 seconds delay for each request after the 3rd
  maxDelayMs: 30000, // Maximum delay of 30 seconds
});

// General API rate limiting (less strict for health checks, etc.)
export const generalRateLimit = rateLimit({
  windowMs: GENERAL_RATE_LIMIT_WINDOW_MS,
  max: GENERAL_RATE_LIMIT_MAX_REQUESTS,
  message: {
    error: 'Too many requests',
    message: 'You have exceeded the general rate limit. Please try again later.',
    retryAfter: describeWindow(GENERAL_RATE_LIMIT_WINDOW_MS),
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Request size limiter middleware
export const requestSizeLimit = (req: any, res: any, next: any) => {
  const maxSize = 1024; // 1KB max request size

  if (req.get('content-length') && parseInt(req.get('content-length')) > maxSize) {
    return res.status(413).json({
      error: 'Request too large',
      message: 'Request payload must be less than 1KB',
      maxSize: `${maxSize} bytes`,
    });
  }

  next();
};

// Usage monitoring middleware
export const usageMonitor = (req: any, res: any, next: any) => {
  const startTime = Date.now();
  const ip = req.ip;
  const userAgent = req.get('User-Agent') || 'unknown';
  const endpoint = req.path;
  const method = req.method;

  // Log request start
  console.log(
    `[USAGE] ${new Date().toISOString()} - ${method} ${endpoint} - IP: ${ip} - UA: ${userAgent.slice(0, 100)}`
  );

  // Override res.end to log completion
  const originalEnd = res.end;
  res.end = function (...args: any[]) {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;

    console.log(
      `[USAGE] Request completed - ${method} ${endpoint} - ${statusCode} - ${duration}ms - IP: ${ip}`
    );

    // Log high-cost operations
    if (endpoint.includes('generate-worksheet')) {
      console.log(
        `[COST] Worksheet generated - IP: ${ip} - Duration: ${duration}ms - Status: ${statusCode}`
      );
    }

    originalEnd.apply(this, args);
  };

  next();
};
