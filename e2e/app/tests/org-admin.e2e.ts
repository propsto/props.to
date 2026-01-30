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
    await expect(page.getByText("Organization URL", { exact: true })).toBeVisible();

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

  test("should display organization URL form", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/org/${orgSlug}/admin/settings`);
    await page.waitForLoadState("networkidle");

    // Should see Organization URL card
    await expect(page.getByText("Organization URL", { exact: true })).toBeVisible({
      timeout: 15000,
    });
    
    // Should see the URL preview (use first() as there may be multiple instances)
    await expect(page.getByText("props.to/").first()).toBeVisible();
    
    // Should see URL slug input with current value
    const slugInput = page.locator("#orgSlug");
    await expect(slugInput).toHaveValue(orgSlug);
    
    // Should see Save URL button (Mike is OWNER)
    const saveButton = page.getByRole("button", { name: /save url/i });
    await expect(saveButton).toBeVisible();
    await expect(saveButton).toBeDisabled(); // Disabled when no changes
  });

  test("should validate slug availability", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/org/${orgSlug}/admin/settings`);
    await page.waitForLoadState("networkidle");

    // Wait for form to load
    await expect(page.getByText("Organization URL", { exact: true })).toBeVisible({
      timeout: 15000,
    });

    // Change the slug to something new
    const slugInput = page.locator("#orgSlug");
    await slugInput.clear();
    await slugInput.fill("test-unique-slug-12345");

    // Wait for availability check
    await expect(page.locator("svg.text-green-500")).toBeVisible({
      timeout: 5000,
    });

    // Save button should be enabled
    const saveButton = page.getByRole("button", { name: /save url/i });
    await expect(saveButton).toBeEnabled();
  });

  test("should display audit log page", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/org/${orgSlug}/admin/audit`);
    await page.waitForLoadState("networkidle");

    // Should see audit log heading
    await expect(page.getByRole("heading", { name: /audit log/i })).toBeVisible({
      timeout: 15000,
    });

    // Should see Activity History card
    await expect(page.getByText("Activity History")).toBeVisible();
  });

  test("should have audit log navigation link", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/org/${orgSlug}/admin`);
    await page.waitForLoadState("networkidle");

    // Should see Audit Log link in admin nav
    const adminNav = page.locator("nav").filter({ hasText: "Overview" });
    const auditLink = adminNav.getByRole("link", { name: /audit log/i });
    await expect(auditLink).toBeVisible({ timeout: 15000 });

    // Navigate to audit log
    await auditLink.click();
    await page.waitForLoadState("networkidle");

    // Should be on audit page
    await expect(page.getByRole("heading", { name: /audit log/i })).toBeVisible({
      timeout: 15000,
    });
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

  test("should display categories page with navigation link", async ({
    page,
    baseURL,
  }) => {
    await page.goto(`${baseURL}/org/${orgSlug}/admin`);
    await page.waitForLoadState("networkidle");

    // Should see Categories link in admin nav
    const adminNav = page.locator("nav").filter({ hasText: "Overview" });
    const categoriesLink = adminNav.getByRole("link", { name: /categories/i });
    await expect(categoriesLink).toBeVisible({ timeout: 15000 });

    // Navigate to categories
    await categoriesLink.click();
    await page.waitForLoadState("networkidle");

    // Should see categories page header
    await expect(page.getByRole("heading", { name: /feedback categories/i })).toBeVisible({
      timeout: 15000,
    });
  });

  test("should display custom and system categories sections", async ({
    page,
    baseURL,
  }) => {
    await page.goto(`${baseURL}/org/${orgSlug}/admin/categories`);
    await page.waitForLoadState("networkidle");

    // Should see Custom Categories section
    await expect(page.getByText("Custom Categories")).toBeVisible({
      timeout: 15000,
    });

    // Should see System Categories section
    await expect(page.getByText("System Categories")).toBeVisible();

    // Should see New Category button
    await expect(page.getByRole("button", { name: /new category/i })).toBeVisible();
  });

  test("should open create category dialog", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/org/${orgSlug}/admin/categories`);
    await page.waitForLoadState("networkidle");

    // Click new category button
    await page.getByRole("button", { name: /new category/i }).click();

    // Should see dialog
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("Create Category")).toBeVisible();

    // Should see form fields
    await expect(page.getByLabel("Name")).toBeVisible();
    await expect(page.getByLabel("Description")).toBeVisible();
    await expect(page.getByText("Color")).toBeVisible();

    // Should see color options
    const colorButtons = page.locator('button[type="button"]').filter({
      has: page.locator('[style*="background-color"]'),
    });
    await expect(colorButtons.first()).toBeVisible();
  });

  test("should create and delete a custom category", async ({
    page,
    baseURL,
  }) => {
    await page.goto(`${baseURL}/org/${orgSlug}/admin/categories`);
    await page.waitForLoadState("networkidle");

    const testCategoryName = `Test Category ${Date.now()}`;

    // Open create dialog
    await page.getByRole("button", { name: /new category/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 5000 });

    // Fill form
    await page.getByLabel("Name").fill(testCategoryName);
    await page.getByLabel("Description").fill("A test category for E2E testing");

    // Submit
    await page.getByRole("button", { name: /create category/i }).click();

    // Dialog should close and category should appear
    await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 5000 });
    await expect(page.getByText(testCategoryName)).toBeVisible({ timeout: 5000 });

    // Now delete the category
    const categoryRow = page.locator("div").filter({ hasText: testCategoryName }).first();
    const deleteButton = categoryRow.getByRole("button").filter({
      has: page.locator("svg.text-destructive"),
    });
    await deleteButton.click();

    // Confirm deletion in dialog
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("Delete Category")).toBeVisible();
    await page.getByRole("button", { name: /^delete$/i }).click();

    // Category should be removed
    await expect(page.getByText(testCategoryName)).not.toBeVisible({ timeout: 5000 });
  });
});
