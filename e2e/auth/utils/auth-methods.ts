import { type Page, expect } from "@playwright/test";

export async function signInByPassword(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  // Fill email using label
  await page.getByLabel("email").fill(email);

  // Click Continue with password twice (UI behavior requires two clicks)
  await page.getByRole("button", { name: "Continue with password" }).click();
  await page.getByRole("button", { name: "Continue with password" }).click();

  // Wait for password field to appear
  await expect(page.getByLabel("password")).toBeVisible({ timeout: 10000 });

  // Fill password
  await page.getByLabel("password").fill(password);

  // Submit
  await page.getByRole("button", { name: "Sign in with password" }).click();
}

/**
 * Wait for post-login redirect to complete.
 * User will be redirected to either:
 * - /welcome (if onboarding not complete)
 * - App dashboard (if onboarding complete)
 */
export async function waitForPostLoginRedirect(page: Page): Promise<void> {
  const appUrl = process.env.PROPSTO_APP_URL ?? "http://localhost:3000";
  // Compare the full origin (host + port). Using only the hostname matches the
  // auth app too when both run on localhost, so this returned before the
  // redirect finished and the caller saw the sign-in page.
  const appOrigin = new URL(appUrl).origin;

  await page.waitForURL(
    url => url.href.includes("/welcome") || url.origin === appOrigin,
    { timeout: 15000 },
  );
}
