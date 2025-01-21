/* eslint-disable @typescript-eslint/no-non-null-assertion -- env vars checked anyway */
import { test, expect } from "@playwright/test";
import { signInByPassword } from "../utils/auth-methods";

test("password authenticate", async ({ page, baseURL }) => {
  await page.goto(baseURL ?? "");
  await expect(page).toHaveTitle(/Authenticate/);
  const requestPromise = page.waitForRequest(process.env.PROPSTO_APP_URL!);
  await signInByPassword(page, "mike.ryan@gmail.com", "P4ssw0rd");
  const request = await requestPromise;
  expect(request.url()).toContain(process.env.PROPSTO_APP_URL!);
});
