/* eslint-disable @typescript-eslint/no-non-null-assertion -- env vars are checked anyway */
import path from "node:path";
import { test } from "@playwright/test";
import { signInByPassword } from "./auth-methods";

const authFile = path.join(__dirname, "../fixtures/user.json");

test("password authenticate", async ({ page, baseURL }) => {
  await page.goto(baseURL ?? "");
  await signInByPassword(page, "mike.ryan@gmail.com", "P4ssw0rd");
  await page.waitForURL(process.env.PROPSTO_APP_URL!);
  await page.context().storageState({ path: authFile });
});
