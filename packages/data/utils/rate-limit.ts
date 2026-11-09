import { constServer } from "@propsto/constants/server";
import { createLogger } from "@propsto/logger";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";

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
  [tokens, window]: Parameters<typeof Ratelimit.slidingWindow>,
  prefix = "propsto:ratelimit",
): Ratelimit | null {
  return redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(tokens, window),
        analytics: true,
        prefix,
      })
    : null;
}

const defaultLimiter = createLimiter([10, "1 m"]);
// Everyone in an office behind one NAT shares an IP, so the IP-wide ceiling
// on public submits is high; the tight limit is per link+IP
const feedbackIpCeiling = createLimiter([120, "1 m"]);
// Each AI form generation is a paid OpenAI call
const aiFormLimiter = createLimiter([20, "1 h"]);
// Stricter for auth
const authLimiter = createLimiter([5, "15 m"], "propsto:auth:ratelimit");

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
async function limit(
  identifier: string,
  limiter: Ratelimit | null,
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
async function getClientIp(): Promise<string> {
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
  const ipResult = await limit(`feedback-ip:${ip}`, feedbackIpCeiling);
  if (!ipResult.success) {
    return ipResult;
  }
  return limit(`feedback:${linkId}:${ip}`, defaultLimiter);
}

/**
 * Rate limit check for slug availability checks
 * Limit: 10 checks per minute per IP
 */
export async function checkSlugCheckRateLimit(): Promise<RateLimitResult> {
  const ip = await getClientIp();
  return limit(`slug-check:${ip}`, defaultLimiter);
}

/**
 * Rate limit check for AI form generation
 * Limit: 20 generations per hour per user
 */
export async function checkAiFormRateLimit(
  userId: string,
): Promise<RateLimitResult> {
  return limit(`ai-form:${userId}`, aiFormLimiter);
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
  const ipResult = await limit(`reset:ip:${ip}`, authLimiter);
  if (!ipResult.success) {
    return ipResult;
  }

  // If email provided, also check email-based limit
  if (email) {
    const emailResult = await limit(`reset:email:${email}`, authLimiter);
    if (!emailResult.success) {
      return emailResult;
    }
  }

  return ipResult;
}

/**
 * Rate limit check for password attempts on a pending account link
 * Limit: 5 attempts per 15 minutes per pending-link token
 */
export async function checkPendingLinkRateLimit(
  token: string,
): Promise<RateLimitResult> {
  return limit(`link:${token}`, authLimiter);
}

/*
 * In-memory limiter for email lookups on the public page. It works without
 * Redis, so the lookup stays limited per instance when Upstash is not set.
 */

interface MemoryRateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory store - resets on server restart
const rateLimitStore = new Map<string, MemoryRateLimitEntry>();

// Clean up expired entries every 5 minutes
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

let cleanupInterval: ReturnType<typeof setInterval> | null = null;

function startCleanup(): void {
  if (cleanupInterval) return;
  cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetAt < now) {
        rateLimitStore.delete(key);
      }
    }
  }, CLEANUP_INTERVAL_MS);
  // Don't prevent process exit
  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }
}

export interface RateLimitConfig {
  /** Maximum requests allowed in the window */
  limit: number;
  /** Window size in milliseconds */
  windowMs: number;
}

export interface MemoryRateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Check and consume an in-memory rate limit for a given key.
 * Returns whether the request is allowed.
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig,
): MemoryRateLimitResult {
  startCleanup();

  const now = Date.now();
  const entry = rateLimitStore.get(key);

  // No existing entry or window expired - create new window
  if (!entry || entry.resetAt < now) {
    const newEntry: MemoryRateLimitEntry = {
      count: 1,
      resetAt: now + config.windowMs,
    };
    rateLimitStore.set(key, newEntry);
    return {
      allowed: true,
      remaining: config.limit - 1,
      resetAt: newEntry.resetAt,
    };
  }

  // Within window - check limit
  if (entry.count >= config.limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }

  // Increment and allow
  entry.count += 1;
  return {
    allowed: true,
    remaining: config.limit - entry.count,
    resetAt: entry.resetAt,
  };
}

// Email lookup specific configuration
// Conservative limits: 10 lookups per minute per identifier
export const EMAIL_LOOKUP_RATE_LIMIT: RateLimitConfig = {
  limit: 10,
  windowMs: 60 * 1000, // 1 minute
};
