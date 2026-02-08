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

test.describe("Account Switcher - Unified View", () => {
  test("should display account info in sidebar header", async ({
    page,
    baseURL,
  }) => {
    await page.goto(`${baseURL}/`);
    await page.waitForLoadState("networkidle");

    // The sidebar should be visible
    const sidebar = page.locator("aside");
    await expect(sidebar).toBeVisible({ timeout: 15000 });

    // Should show Props.to branding
    await expect(sidebar.getByText("Props.to")).toBeVisible({ timeout: 10000 });
  });

  test("should show personal and org accounts in dropdown", async ({
    page,
    baseURL,
  }) => {
    await page.goto(`${baseURL}/`);
    await page.waitForLoadState("networkidle");

    const sidebar = page.locator("aside");
    await expect(sidebar).toBeVisible({ timeout: 15000 });

    // Click account switcher to open dropdown
    const switcherButton = sidebar
      .locator("button")
      .filter({ hasText: "Props.to" })
      .first();
    await expect(switcherButton).toBeVisible({ timeout: 10000 });
    await switcherButton.click();

    // Should see Personal section
    await expect(page.getByText("Personal")).toBeVisible({ timeout: 5000 });

    // Should see Organizations section (Mike Ryan belongs to Acme)
    await expect(page.getByText("Organizations")).toBeVisible({
      timeout: 5000,
    });
    await expect(page.getByText("Acme Corp")).toBeVisible({ timeout: 5000 });
  });

  test("should navigate to org admin from dropdown", async ({
    page,
    baseURL,
  }) => {
    await page.goto(`${baseURL}/`);
    await page.waitForLoadState("networkidle");

    const sidebar = page.locator("aside");
    await expect(sidebar).toBeVisible({ timeout: 15000 });

    // Open dropdown
    const switcherButton = sidebar
      .locator("button")
      .filter({ hasText: "Props.to" })
      .first();
    await switcherButton.click();

    // Click Acme Corp to go to admin
    const orgItem = page.getByRole("menuitem").filter({ hasText: "Acme Corp" });
    await expect(orgItem).toBeVisible({ timeout: 5000 });
    await orgItem.click();

    // Should navigate to org admin
    await page.waitForURL(/\/org\/acme\/admin/, { timeout: 10000 });
  });

  test("should always show unified navigation regardless of URL", async ({
    page,
    baseURL,
  }) => {
    // Navigate to org admin page
    await page.goto(`${baseURL}/org/acme/admin`);
    await page.waitForLoadState("networkidle");

    const sidebar = page.locator("aside");
    await expect(sidebar).toBeVisible({ timeout: 15000 });

    // Should still show the unified personal navigation
    await expect(sidebar.getByRole("link", { name: /dashboard/i })).toBeVisible(
      { timeout: 10000 },
    );
    await expect(
      sidebar.getByRole("link", { name: /my links/i }),
    ).toBeVisible();
    await expect(
      sidebar.getByRole("link", { name: /templates/i }),
    ).toBeVisible();
  });

  test("should show user email in footer", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/`);
    await page.waitForLoadState("networkidle");

    const sidebar = page.locator("aside");
    await expect(sidebar).toBeVisible({ timeout: 15000 });

    // Footer should show user info with email
    const footer = sidebar.locator("footer");
    await expect(footer).toBeVisible();
    await expect(footer.getByText(/@/).first()).toBeVisible({ timeout: 5000 });
  });
});
