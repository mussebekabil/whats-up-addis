import rateLimit from 'express-rate-limit';
import type { Request } from 'express';

// Use req.ip directly as the rate-limit key. Express computes req.ip based on
// the app's 'trust proxy' setting, so this works correctly whether or not
// trust proxy is enabled, without triggering express-rate-limit's internal
// X-Forwarded-For / trust proxy validation (which throws even when the
// `validate` option is set to disable it).
const keyGenerator = (req: Request): string => req.ip || 'unknown';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  keyGenerator,
  validate: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  keyGenerator,
  validate: false,
});
