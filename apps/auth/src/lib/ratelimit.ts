import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { constServer } from "@propsto/constants/server";
import { headers } from "next/headers";
import { createLogger } from "@propsto/logger";

const logger = createLogger("ratelimit");

// Create rate limiter instance if Redis is configured
const ratelimit =
  constServer.UPSTASH_REDIS_REST_URL && constServer.UPSTASH_REDIS_REST_TOKEN
    ? new Ratelimit({
        redis: new Redis({
          url: constServer.UPSTASH_REDIS_REST_URL,
          token: constServer.UPSTASH_REDIS_REST_TOKEN,
        }),
        limiter: Ratelimit.slidingWindow(5, "15 m"), // Stricter for auth
        analytics: true,
        prefix: "propsto:auth:ratelimit",
      })
    : null;

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Get client IP address from request headers
 */
async function getClientIp(): Promise<string> {
  const headersList = await headers();
  return (
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headersList.get("x-real-ip") ??
    "unknown"
  );
}

/**
 * Check rate limit for an identifier
 * Returns success: true if not configured (graceful degradation)
 */
async function checkRateLimit(identifier: string): Promise<RateLimitResult> {
  if (!ratelimit) {
    return { success: true, limit: 0, remaining: 0, reset: 0 };
  }

  try {
    const result = await ratelimit.limit(identifier);
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (error) {
    logger("Rate limiting failed", { error, identifier });
    return { success: true, limit: 0, remaining: 0, reset: 0 };
  }
}

/**
 * Rate limit check for password reset requests
 * Limit: 5 requests per 15 minutes per IP and email
 */
export async function checkPasswordResetRateLimit(
  email?: string,
): Promise<RateLimitResult> {
  const ip = await getClientIp();

  // Check IP-based limit first
  const ipResult = await checkRateLimit(`reset:ip:${ip}`);
  if (!ipResult.success) {
    return ipResult;
  }

  // If email provided, also check email-based limit
  if (email) {
    const emailResult = await checkRateLimit(`reset:email:${email}`);
    if (!emailResult.success) {
      return emailResult;
    }
  }

  return ipResult;
}

/**
 * Rate limit check for sign-in attempts
 * Limit: 10 attempts per 15 minutes per IP
 */
export async function checkSignInRateLimit(): Promise<RateLimitResult> {
  const ip = await getClientIp();
  return checkRateLimit(`signin:${ip}`);
}
