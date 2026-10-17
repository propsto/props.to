import { sentryOptions } from "@propsto/logger/sentry";

// Sentry stays unloaded until NEXT_PUBLIC_SENTRY_DSN is set at build time.
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  void import("@sentry/nextjs").then(Sentry => {
    Sentry.init({
      dsn,
      environment: process.env.NEXT_PUBLIC_VERCEL_ENV,
      ...sentryOptions,
    });
  });
}
