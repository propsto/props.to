import { test, expect } from "@playwright/test";

/**
 * props.to/<email> redirects to the person's real page. Seed: Acme's
 * Workspace domain is acme.com and John's Acme username is john.doe; his
 * personal username is johndoe and his personal email john.personal@example.com.
 */

const APP_URL = process.env.PROPSTO_APP_URL ?? "";

test.use({ storageState: { cookies: [], origins: [] } });

test.describe("email shortcut", () => {
  test("a company email goes to the member's org page", async ({ page }) => {
    await page.goto(`${APP_URL}/john.doe@acme.com`);
    await expect(page).toHaveURL(`${APP_URL}/acme/john.doe`);
  });

  test("a personal email goes to the personal profile", async ({ page }) => {
    await page.goto(`${APP_URL}/john.personal@example.com`);
    await expect(page).toHaveURL(`${APP_URL}/johndoe`);
  });

  test("an unknown email is not found", async ({ page }) => {
    const response = await page.goto(`${APP_URL}/nobody@acme.com`);
    expect(response?.status()).toBe(404);
  });
});
