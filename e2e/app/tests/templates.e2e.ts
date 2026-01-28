import { test, expect } from "@playwright/test";

// Track JavaScript errors to catch client-side issues early
let jsErrors: string[] = [];

test.beforeEach(async ({ page }) => {
  jsErrors = [];
  // Only capture actual JavaScript errors, not network/resource errors
  page.on("pageerror", error => {
    jsErrors.push(error.message);
  });
});

test.afterEach(async ({}, testInfo) => {
  // Only fail on errors if the test itself passed (to avoid masking the real failure)
  if (testInfo.status === "passed" && jsErrors.length > 0) {
    throw new Error(`Client-side errors detected:\n${jsErrors.join("\n")}`);
  }
  // Log errors even if test failed (for debugging)
  if (jsErrors.length > 0) {
    console.log("JS errors during test:", jsErrors);
  }
});

test.describe("Feedback Templates", () => {
  test("should display templates page when authenticated", async ({
    page,
    baseURL,
  }) => {
    await page.goto(`${baseURL}/templates`);
    await page.waitForLoadState("networkidle");

    // Verify the heading is visible (not just in RSC payload)
    // This will fail if session is not working
    await expect(
      page.getByRole("heading", { name: /feedback templates/i }),
    ).toBeVisible({ timeout: 15000 });

    // Verify tabs are present
    await expect(
      page.getByRole("tab", { name: /my templates/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("tab", { name: /default templates/i }),
    ).toBeVisible();
  });

  test("should navigate to create template page", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/templates`);
    await page.waitForLoadState("networkidle");

    // Wait for page to render authenticated content
    await expect(
      page.getByRole("heading", { name: /feedback templates/i }),
    ).toBeVisible({ timeout: 15000 });

    // Click create template button
    await page.getByRole("link", { name: /create template/i }).click();

    // Verify we're on the create page with visible heading
    await expect(page).toHaveURL(/\/templates\/new/);
    await expect(
      page.getByRole("heading", { name: /create template/i }),
    ).toBeVisible({ timeout: 15000 });
  });

  test("should create a new template manually", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/templates/new`);
    await page.waitForLoadState("networkidle");

    // Wait for form to load
    await expect(
      page.getByRole("heading", { name: /create template/i }),
    ).toBeVisible({ timeout: 15000 });

    // Generate unique name for this test run
    const uniqueName = `E2E Test Template ${Date.now()}`;

    // Fill out the template name
    await page.getByLabel(/template name/i).fill(uniqueName);

    // Fill optional description
    await page.getByLabel(/description/i).fill("Test template created by E2E");

    // Select feedback type using the combobox
    const feedbackTypeSection = page
      .locator("text=Feedback Type")
      .locator("..");
    await feedbackTypeSection.getByRole("combobox").click();

    // Wait for options and select "Peer Review"
    const feedbackTypeOption = page.getByRole("option", {
      name: /peer review/i,
    });
    await expect(feedbackTypeOption).toBeVisible({ timeout: 5000 });
    await feedbackTypeOption.click();

    // Small delay to ensure the value is set
    await page.waitForTimeout(500);

    // Add a field manually
    await page.getByRole("button", { name: /add field/i }).click();

    // Wait for field editor to appear
    await expect(page.getByText(/field 1/i)).toBeVisible({ timeout: 5000 });

    // Fill in field label
    const labelInput = page.locator('input[name="fields.0.label"]');
    await labelInput.fill("What did they do well?");

    // Select field type - find the type dropdown within field 1
    const fieldTypeSection = page
      .locator("text=Field 1")
      .locator("..")
      .locator("..")
      .getByRole("combobox")
      .nth(0);

    // The first combobox after "Field 1" is the type selector
    const typeSelectors = page.locator('[name="fields.0.type"]').locator("..");
    await typeSelectors.getByRole("combobox").click();

    // Select "Text (multi-line)"
    const fieldTypeOption = page.getByRole("option", {
      name: /text \(multi-line\)/i,
    });
    await expect(fieldTypeOption).toBeVisible({ timeout: 5000 });
    await fieldTypeOption.click();

    // Submit the form
    const submitButton = page.getByRole("button", { name: /create template/i });
    await expect(submitButton).toBeEnabled({ timeout: 5000 });
    await submitButton.click();

    // Wait for navigation back to templates list
    try {
      await page.waitForURL(/\/templates$/, { timeout: 20000 });
    } catch (error) {
      // If timeout, log the current state for debugging
      const currentUrl = page.url();
      const errorText = await page
        .locator(".text-destructive")
        .textContent()
        .catch(() => "No error shown");
      console.log("Current URL:", currentUrl);
      console.log("Error text:", errorText);
      throw error;
    }

    // Verify the template appears in the list
    // Click on "My Templates" tab to ensure we're viewing user templates
    await page.getByRole("tab", { name: /my templates/i }).click();

    await expect(page.getByText(uniqueName).first()).toBeVisible({
      timeout: 15000,
    });
  });

  test("should display default templates in default tab", async ({
    page,
    baseURL,
  }) => {
    await page.goto(`${baseURL}/templates`);
    await page.waitForLoadState("networkidle");

    // Wait for page to render
    await expect(
      page.getByRole("heading", { name: /feedback templates/i }),
    ).toBeVisible({ timeout: 15000 });

    // Click on Default Templates tab
    await page.getByRole("tab", { name: /default templates/i }).click();

    // Verify seeded default templates are visible
    // The seed data creates: Quick Props, 360° Feedback, Anonymous Feedback, Leadership Feedback, Peer Review
    await expect(page.getByText("Quick Props").first()).toBeVisible({
      timeout: 10000,
    });
  });
});
