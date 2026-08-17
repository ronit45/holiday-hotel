import helmet from "helmet";
import rateLimit from "express-rate-limit";

// Security middleware — API does not need cross-origin embedding of responses
export const helmetMiddleware = helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false, // Swagger UI needs inline assets
});

// Rate limiting - more lenient for general requests
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, 
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Special limiter for payment endpoints
export const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, 
  message: "Too many payment requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});
