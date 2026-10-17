import type { Instrumentation } from "next";
import { sentryOptions } from "@propsto/logger/sentry";

// Sentry stays unloaded until SENTRY_DSN is set.
const dsn = process.env.SENTRY_DSN;

export async function register(): Promise<void> {
  if (!dsn) return;
  const Sentry = await import("@sentry/nextjs");
  Sentry.init({
    dsn,
    environment: process.env.VERCEL_ENV ?? process.env.PROPSTO_ENV,
    ...sentryOptions,
  });
}

export const onRequestError: Instrumentation.onRequestError = async (
  ...args
) => {
  if (!dsn) return;
  const Sentry = await import("@sentry/nextjs");
  Sentry.captureRequestError(...args);
};
