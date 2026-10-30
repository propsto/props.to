import { test, expect } from "@playwright/test";
import { signInByPassword } from "../../auth/utils/auth-methods";

/**
 * Values layer tagging and reading (feedback layers plan, V2). Runs as mike.
 * Seed: Acme has values Ownership, Candor, Craft and one approved Acme
 * feedback to Mike tagged Candor; Globex has no values.
 */

const AUTH_URL = process.env.AUTH_URL ?? "";
const APP_URL = process.env.PROPSTO_APP_URL ?? "";
const PICKER = "Which values did they show?";

test.describe("Organization values on feedback", () => {
  test("org link shows the value picker and the tag persists", async ({
    page,
    baseURL,
  }) => {
    await page.goto(`${baseURL}/acme/john.doe/john-acme`);
    await expect(page.getByText(PICKER)).toBeVisible({ timeout: 15000 });

    const text = `Tagged by E2E ${Date.now()}`;
    await page.getByLabel("Candor").check();
    await page
      .getByLabel(/what do you appreciate about this person/i)
      .fill(text);
    await page.getByRole("button", { name: /submit feedback/i }).click();
    await page.waitForURL(/\/john-acme\/thanks/, { timeout: 20000 });

    // Acme moderates, so the sender's own view shows the submission
    await page.goto(`${baseURL}/feedback/sent`);
    await page.getByText(text).click();
    await expect(page.getByText("Details", { exact: true })).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByText("Candor", { exact: true })).toBeVisible();
    await expect(page.getByText("Ownership", { exact: true })).toHaveCount(0);
  });

  test("received list filters by value", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/feedback`);
    const filter = page.getByRole("navigation", { name: "Filter by value" });
    await filter.getByRole("link", { name: "Candor" }).click();
    await expect(page).toHaveURL(/\/feedback\?value=/);

    await expect(
      page.getByText("Told us early that the launch plan would slip"),
    ).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Older seeded feedback/)).toHaveCount(0);
  });
});

test.describe("Organization without values", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("shows the form without a value picker", async ({ page }) => {
    // John is a Globex ADMIN, so the members-only form is open to him
    await page.goto(AUTH_URL);
    await signInByPassword(page, "john.doe@acme.com", "P4ssw0rd");
    await page.waitForURL(`${APP_URL}/**`, { timeout: 30000 });

    await page.goto(`${APP_URL}/globex/carol.white/carol-globex`);
    await expect(page.getByText(/share your feedback/i)).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByText(PICKER)).toHaveCount(0);
  });
});
