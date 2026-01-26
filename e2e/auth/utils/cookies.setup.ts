/* eslint-disable @typescript-eslint/no-non-null-assertion -- env vars are checked anyway */
import path from "node:path";
import { test } from "@playwright/test";
import { signInByPassword } from "./auth-methods";

const userJson = path.resolve(__dirname, "../fixtures/user.json");

test("password authenticate", async ({ page, baseURL }) => {
  // Use AUTH_URL if available (for app tests), otherwise use baseURL (for auth tests)
  const authUrl = process.env.AUTH_URL ?? baseURL ?? "";
  await page.goto(authUrl);
  await signInByPassword(page, "mike.ryan@example.com", "P4ssw0rd");
  await page.waitForURL(process.env.PROPSTO_APP_URL!);
  await page.context().storageState({ path: userJson });
});
