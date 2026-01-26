/* eslint-disable @typescript-eslint/no-non-null-assertion -- env vars are checked anyway */
import path from "node:path";
import { test, expect } from "@playwright/test";
import { signInByPassword } from "./auth-methods";

const userJson = path.resolve(__dirname, "../fixtures/user.json");

test("password authenticate", async ({ page, baseURL }) => {
  // Use AUTH_URL if available (for app tests), otherwise use baseURL (for auth tests)
  const authUrl = process.env.AUTH_URL ?? baseURL ?? "";
  const appUrl = process.env.PROPSTO_APP_URL!;

  console.log(`Auth URL: ${authUrl}`);
  console.log(`App URL: ${appUrl}`);

  await page.goto(authUrl);
  await signInByPassword(page, "mike.ryan@example.com", "P4ssw0rd");

  // Wait for redirect to app - use pattern matching for flexibility
  await page.waitForURL(`${appUrl}/**`, { timeout: 30000 });

  console.log(`Final URL: ${page.url()}`);

  // Verify we're on the app and authenticated
  const cookies = await page.context().cookies();
  console.log(
    `Cookies after login: ${JSON.stringify(cookies.map(c => ({ name: c.name, domain: c.domain })))}`,
  );

  // Save storage state
  await page.context().storageState({ path: userJson });
  console.log(`Saved storage state to: ${userJson}`);
});
