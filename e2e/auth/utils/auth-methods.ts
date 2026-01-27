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
