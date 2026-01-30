import { test, expect } from "@playwright/test";

// Track JavaScript errors
let jsErrors: string[] = [];

test.beforeEach(async ({ page }) => {
  jsErrors = [];
  page.on("pageerror", (error) => {
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

test.describe("Organization Admin Panel", () => {
  // Mike Ryan is seeded as OWNER of acme org
  const orgSlug = "acme";

  test("should display admin overview page when authenticated as org admin", async ({
    page,
    baseURL,
  }) => {
    await page.goto(`${baseURL}/org/${orgSlug}/admin`);
    await page.waitForLoadState("networkidle");

    // Should see the admin page header
    await expect(page.getByText("Organization Admin")).toBeVisible({
      timeout: 15000,
    });

    // Should see navigation tabs in the admin nav (not sidebar)
    const adminNav = page.locator("nav").filter({ hasText: "Overview" });
    await expect(adminNav.getByRole("link", { name: /overview/i })).toBeVisible();
    await expect(adminNav.getByRole("link", { name: /members/i })).toBeVisible();
    await expect(adminNav.getByRole("link", { name: /settings/i })).toBeVisible();

    // Should see stats cards
    await expect(page.getByText("Total Members")).toBeVisible();
    await expect(page.getByText("Templates")).toBeVisible();
    await expect(page.getByText("Total Feedback")).toBeVisible();
  });

  test("should display members list", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/org/${orgSlug}/admin/members`);
    await page.waitForLoadState("networkidle");

    // Should see members heading
    await expect(page.getByRole("heading", { name: /members/i }).first()).toBeVisible({
      timeout: 15000,
    });

    // Should see the All Members card
    await expect(page.getByText("All Members")).toBeVisible();

    // Should see member table with data
    await expect(page.getByRole("table")).toBeVisible({ timeout: 10000 });
    
    // Should see at least one member row with role badge
    await expect(page.getByText(/OWNER|ADMIN|MEMBER/).first()).toBeVisible();
  });

  test("should display settings page with editable form", async ({
    page,
    baseURL,
  }) => {
    await page.goto(`${baseURL}/org/${orgSlug}/admin/settings`);
    await page.waitForLoadState("networkidle");

    // Should see settings heading
    await expect(page.getByRole("heading", { name: /settings/i })).toBeVisible({
      timeout: 15000,
    });

    // Should see General settings card
    await expect(page.getByText("Organization Name")).toBeVisible();
    await expect(page.getByText("Organization URL")).toBeVisible();

    // Should see Member Defaults card with form
    await expect(page.getByText("Member Defaults")).toBeVisible();
    await expect(page.getByText("Default Profile Visibility")).toBeVisible();
    await expect(page.getByText("Allow External Feedback")).toBeVisible();

    // Should see save button (disabled by default when no changes)
    const saveButton = page.getByRole("button", { name: /save changes/i });
    await expect(saveButton).toBeVisible();
    await expect(saveButton).toBeDisabled();
  });

  test("should enable save button when settings are changed", async ({
    page,
    baseURL,
  }) => {
    await page.goto(`${baseURL}/org/${orgSlug}/admin/settings`);
    await page.waitForLoadState("networkidle");

    // Wait for form to load
    await expect(page.getByText("Member Defaults")).toBeVisible({
      timeout: 15000,
    });

    // Find and click the external feedback toggle
    const externalToggle = page.locator("#external");
    await externalToggle.click();

    // Save button should now be enabled
    const saveButton = page.getByRole("button", { name: /save changes/i });
    await expect(saveButton).toBeEnabled();
  });

  test("should save settings successfully", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/org/${orgSlug}/admin/settings`);
    await page.waitForLoadState("networkidle");

    // Wait for form
    await expect(page.getByText("Member Defaults")).toBeVisible({
      timeout: 15000,
    });

    // Toggle a setting
    const externalToggle = page.locator("#external");
    const initialState = await externalToggle.isChecked();
    await externalToggle.click();

    // Click save
    const saveButton = page.getByRole("button", { name: /save changes/i });
    await expect(saveButton).toBeEnabled();
    await saveButton.click();

    // Button should show saving state or become disabled after save
    await expect(saveButton).toBeDisabled({ timeout: 5000 });

    // Reload and verify the setting persisted
    await page.reload();
    await page.waitForLoadState("networkidle");

    const newState = await page.locator("#external").isChecked();
    expect(newState).toBe(!initialState);

    // Reset the toggle back to original state for other tests
    await page.locator("#external").click();
    await page.getByRole("button", { name: /save changes/i }).click();
  });
});
