import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { constServer } from "@propsto/constants/server";
import { headers } from "next/headers";
import { createLogger } from "@propsto/logger";

const logger = createLogger("ratelimit");

const redis =
  constServer.UPSTASH_REDIS_REST_URL && constServer.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: constServer.UPSTASH_REDIS_REST_URL,
        token: constServer.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

// Create rate limiter instances if Redis is configured
function createLimiter(
  ...[tokens, window]: Parameters<typeof Ratelimit.slidingWindow>
): Ratelimit | null {
  return redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(tokens, window),
        analytics: true,
        prefix: "propsto:ratelimit",
      })
    : null;
}

const ratelimit = createLimiter(10, "1 m");
// Everyone in an office behind one NAT shares an IP, so the IP-wide ceiling
// on public submits is high; the tight limit is per link+IP
const feedbackIpCeiling = createLimiter(120, "1 m");

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Check rate limit for an identifier
 * Returns success: true if not configured (graceful degradation)
 */
export async function checkRateLimit(
  identifier: string,
  limiter: Ratelimit | null = ratelimit,
): Promise<RateLimitResult> {
  if (!limiter) {
    // Rate limiting not configured - allow all requests
    return { success: true, limit: 0, remaining: 0, reset: 0 };
  }

  try {
    const result = await limiter.limit(identifier);
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (error) {
    // On error, allow request but log warning
    logger("Rate limiting failed", { error, identifier });
    return { success: true, limit: 0, remaining: 0, reset: 0 };
  }
}

/**
 * Get client IP address from request headers
 */
export async function getClientIp(): Promise<string> {
  const headersList = await headers();
  return (
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headersList.get("x-real-ip") ??
    "unknown"
  );
}

/**
 * Rate limit check for feedback submission
 * Limit: 10 submissions per minute per link+IP, 120 per minute per IP
 */
export async function checkFeedbackRateLimit(
  linkId: string,
): Promise<RateLimitResult> {
  const ip = await getClientIp();
  const ipResult = await checkRateLimit(`feedback-ip:${ip}`, feedbackIpCeiling);
  if (!ipResult.success) {
    return ipResult;
  }
  return checkRateLimit(`feedback:${linkId}:${ip}`);
}

/**
 * Rate limit check for slug availability checks
 * Limit: 10 checks per minute per IP
 */
export async function checkSlugCheckRateLimit(): Promise<RateLimitResult> {
  const ip = await getClientIp();
  return checkRateLimit(`slug-check:${ip}`);
}

/**
 * Rate limit check for password reset requests
 * Limit: 5 requests per 15 minutes per IP/email
 */
export async function checkPasswordResetRateLimit(
  email?: string,
): Promise<RateLimitResult> {
  const ip = await getClientIp();
  const identifier = email ? `reset:${email}` : `reset:${ip}`;
  return checkRateLimit(identifier);
}
