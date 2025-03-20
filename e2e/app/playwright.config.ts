import path from "node:path";
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testMatch: "**/*.e2e.{ts,tsx}",
  retries: 2,
  use: {
    baseURL: process.env.PROPSTO_APP_URL,
    ...devices["Desktop Chrome"],
  },
  projects: [
    {
      name: "setup",
      testMatch: /cookies\.setup\.ts/,
      testDir: path.resolve(__dirname, "../auth/utils/"),
    },
    {
      name: "app",
      use: {
        storageState: path.resolve("./../auth/fixtures/user.json"),
      },
      dependencies: ["setup"],
    },
  ],
});
