import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';

// Strict rate limiting for worksheet generation (most expensive operation)
export const worksheetRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 10, // Limit each IP to 10 requests per hour
  message: {
    error: 'Too many worksheet requests',
    message: 'You have exceeded the rate limit of 10 worksheets per hour. Please try again later.',
    retryAfter: '1 hour',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Custom key generator to include user agent for better tracking
  keyGenerator: req => {
    return `${req.ip}-${req.get('User-Agent')?.slice(0, 50) || 'unknown'}`;
  },
  // Skip requests that don't consume resources
  skip: req => {
    return req.path === '/api/health';
  },
});

// Progressive delay for worksheet requests to discourage rapid requests
export const worksheetSlowDown = slowDown({
  windowMs: 60 * 60 * 1000, // 1 hour window
  delayAfter: 3, // Allow 3 requests per hour at full speed
  delayMs: hits => hits * 2000, // Add 2 seconds delay for each request after the 3rd
  maxDelayMs: 30000, // Maximum delay of 30 seconds
  // Custom key generator to match rate limiter
  keyGenerator: req => {
    return `${req.ip}-${req.get('User-Agent')?.slice(0, 50) || 'unknown'}`;
  },
});

// General API rate limiting (less strict for health checks, etc.)
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per 15 minutes
  message: {
    error: 'Too many requests',
    message: 'You have exceeded the general rate limit. Please try again later.',
    retryAfter: '15 minutes',
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
