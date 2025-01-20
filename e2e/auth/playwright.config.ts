import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testMatch: "**/*.e2e.{ts,tsx}",
  retries: 2,
  use: {
    baseURL: process.env.AUTH_URL,
    ...devices["Desktop Chrome"],
  },
});
