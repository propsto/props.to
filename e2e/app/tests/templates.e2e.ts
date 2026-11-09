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
    const labelInput = page.getByPlaceholder("Question text");
    await labelInput.fill("What did they do well?");

    // Select field type - find the "Type" label (exact match) and get its sibling combobox
    // Note: "Feedback Type" is different from "Type" - exact match avoids confusion
    const typeSection = page.getByText("Type", { exact: true }).locator("..");
    await typeSection.getByRole("combobox").click();

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

test.describe("Organization template categories", () => {
  // Mike Ryan is seeded as OWNER of acme org
  const orgSlug = "acme";

  test("should create an org template with an org category and list it", async ({
    page,
    baseURL,
  }) => {
    const stamp = Date.now();
    const categoryName = `E2E Category ${stamp}`;
    const templateName = `E2E Org Template ${stamp}`;

    // Create a custom category
    await page.goto(`${baseURL}/org/${orgSlug}/admin/categories`);
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /new category/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 5000 });
    await page.getByLabel("Name").fill(categoryName);
    await page.getByRole("button", { name: /create category/i }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 5000 });
    await expect(page.getByText(categoryName)).toBeVisible({ timeout: 5000 });

    // Create an org template in that category
    await page.goto(`${baseURL}/org/${orgSlug}/admin/templates/new`);
    await page.waitForLoadState("networkidle");
    await expect(
      page.getByRole("heading", { name: /create organization template/i }),
    ).toBeVisible({ timeout: 15000 });

    await page.getByLabel(/template name/i).fill(templateName);

    const categorySection = page
      .getByText("Category", { exact: true })
      .locator("..");
    await categorySection.getByRole("combobox").click();
    const categoryOption = page.getByRole("option", { name: categoryName });
    await expect(categoryOption).toBeVisible({ timeout: 5000 });
    await categoryOption.click();
    await expect(categorySection.getByRole("combobox")).toHaveText(
      categoryName,
    );

    await page.getByRole("button", { name: /create template/i }).click();
    await page.waitForURL(new RegExp(`/org/${orgSlug}/admin/templates$`), {
      timeout: 20000,
    });

    // The templates list shows the template with its category
    const row = page.getByRole("row").filter({ hasText: templateName });
    await expect(row).toBeVisible({ timeout: 15000 });
    await expect(row.getByRole("cell", { name: categoryName })).toBeVisible();
  });
});
