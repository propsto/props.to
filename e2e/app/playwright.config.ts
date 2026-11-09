import path from "node:path";
import { defineConfig, devices } from "@playwright/test";

const storageStatePath = path.resolve(__dirname, "../auth/fixtures/user.json");

export default defineConfig({
  testMatch: "**/*.e2e.{ts,tsx}",
  retries: 2,
  use: {
    baseURL: process.env.PROPSTO_APP_URL,
    ...devices["Desktop Chrome"],
    // Failed tests keep a trace (network, console, DOM) in test-results/,
    // which the E2E workflow already uploads as an artifact.
    trace: "retain-on-failure",
    // Vercel injects its preview toolbar (vercel.live) into every preview
    // page. Its feedback iframe holds a connection open, so
    // waitForLoadState("networkidle") never resolves on dashboard pages.
    // The toolbar has no role in tests; resolve its host to nothing.
    launchOptions: {
      args: ["--host-resolver-rules=MAP vercel.live ~NOTFOUND"],
    },
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
        storageState: storageStatePath,
      },
      dependencies: ["setup"],
    },
  ],
});
