import { test, expect } from "@playwright/test";

// Track JavaScript errors
let jsErrors: string[] = [];

test.beforeEach(async ({ page }) => {
  jsErrors = [];
  page.on("pageerror", error => {
    jsErrors.push(error.message);
  });
});

test.afterEach(async ({}, testInfo) => {
  if (testInfo.status === "passed" && jsErrors.length > 0) {
    throw new Error(`Client-side errors detected:\n${jsErrors.join("\n")}`);
  }
  if (jsErrors.length > 0) {
    console.log("JS errors during test:", jsErrors);
  }
});

test.describe("Account Switcher", () => {
  test("should display account switcher in sidebar", async ({
    page,
    baseURL,
  }) => {
    await page.goto(`${baseURL}/`);
    await page.waitForLoadState("networkidle");

    // The sidebar should have an account switcher button
    const sidebar = page.locator("aside");
    await expect(sidebar).toBeVisible({ timeout: 15000 });

    // Should show "Personal" context by default on the home page
    await expect(sidebar.getByText("Personal")).toBeVisible({ timeout: 10000 });
  });

  test("should show organization in account switcher dropdown", async ({
    page,
    baseURL,
  }) => {
    await page.goto(`${baseURL}/`);
    await page.waitForLoadState("networkidle");

    // Wait for sidebar to load
    const sidebar = page.locator("aside");
    await expect(sidebar).toBeVisible({ timeout: 15000 });

    // Click the account switcher to open dropdown
    const switcherButton = sidebar
      .locator("button")
      .filter({ hasText: "Personal" })
      .first();
    await expect(switcherButton).toBeVisible({ timeout: 10000 });
    await switcherButton.click();

    // Should see "Organizations" section in dropdown
    await expect(page.getByText("Organizations")).toBeVisible({
      timeout: 5000,
    });

    // Mike Ryan (seeded user) belongs to Acme org
    await expect(page.getByText("Acme Corp")).toBeVisible({ timeout: 5000 });
  });

  test("should switch to organization context", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/`);
    await page.waitForLoadState("networkidle");

    // Wait for sidebar
    const sidebar = page.locator("aside");
    await expect(sidebar).toBeVisible({ timeout: 15000 });

    // Open account switcher
    const switcherButton = sidebar
      .locator("button")
      .filter({ hasText: "Personal" })
      .first();
    await expect(switcherButton).toBeVisible({ timeout: 10000 });
    await switcherButton.click();

    // Click on Acme Corp to switch
    const orgItem = page.getByRole("menuitem").filter({ hasText: "Acme Corp" });
    await expect(orgItem).toBeVisible({ timeout: 5000 });
    await orgItem.click();

    // Should navigate to org page
    await page.waitForURL(/\/org\/acme/, { timeout: 10000 });

    // Sidebar should now show org context
    await expect(sidebar.getByText("Work")).toBeVisible({ timeout: 10000 });
  });

  test("should switch back to personal context from org", async ({
    page,
    baseURL,
  }) => {
    // Start in org context
    await page.goto(`${baseURL}/org/acme/admin`);
    await page.waitForLoadState("networkidle");

    const sidebar = page.locator("aside");
    await expect(sidebar).toBeVisible({ timeout: 15000 });

    // Should show org context in sidebar header
    await expect(sidebar.getByText("Acme Corp").first()).toBeVisible({
      timeout: 10000,
    });

    // Open account switcher
    const switcherButton = sidebar
      .locator("button")
      .filter({ hasText: "Acme Corp" })
      .first();
    await switcherButton.click();

    // Click Personal to switch back
    const personalItem = page
      .getByRole("menuitem")
      .filter({ hasText: "Personal" });
    await expect(personalItem).toBeVisible({ timeout: 5000 });
    await personalItem.click();

    // Should navigate to home
    await page.waitForURL(/\/$/, { timeout: 10000 });
  });

  test("should display correct email in footer based on context", async ({
    page,
    baseURL,
  }) => {
    await page.goto(`${baseURL}/`);
    await page.waitForLoadState("networkidle");

    // The NavUser footer should be visible with the user's email
    const sidebar = page.locator("aside");
    await expect(sidebar).toBeVisible({ timeout: 15000 });

    // Footer should show user info
    const footer = sidebar.locator("footer");
    await expect(footer).toBeVisible();

    // Should show the user's email
    await expect(footer.getByText(/@/).first()).toBeVisible({ timeout: 5000 });
  });
});
