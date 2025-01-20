import { type Page } from "@playwright/test";

export async function signInByPassword(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  await page.getByPlaceholder("Email").fill(email);
  await page.getByRole("button", { name: "Continue with password" }).click();
  await page.getByRole("button", { name: "Continue with password" }).click();
  await page.getByPlaceholder("Password").fill(password);
  await page.getByRole("button", { name: "Sign in with password" }).click();
}
