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

test.describe("Feedback Links", () => {
  test("should display links page when authenticated", async ({
    page,
    baseURL,
  }) => {
    await page.goto(`${baseURL}/links`);
    await page.waitForLoadState("networkidle");

    // Verify the heading is visible (not just in RSC payload)
    // This will fail if session is not working
    await expect(
      page.getByRole("heading", { name: /feedback links/i }),
    ).toBeVisible({ timeout: 15000 });
  });

  test("should navigate to create link page", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/links`);
    await page.waitForLoadState("networkidle");

    // Wait for page to render authenticated content
    await expect(
      page.getByRole("heading", { name: /feedback links/i }),
    ).toBeVisible({ timeout: 15000 });

    // Click create link button
    await page
      .getByRole("link", { name: /create link/i })
      .first()
      .click();

    // Verify we're on the create page with visible heading
    await expect(page).toHaveURL(/\/links\/new/);
    await expect(
      page.getByRole("heading", { name: /create feedback link/i }),
    ).toBeVisible({ timeout: 15000 });
  });

  test("should create a new feedback link", async ({ page, baseURL }) => {
    const uniqueSlug = `e2e-test-${Date.now()}`;
    await page.goto(`${baseURL}/links/new`);
    await page.waitForLoadState("networkidle");

    // Wait for form to load
    await expect(
      page.getByRole("heading", { name: /create feedback link/i }),
    ).toBeVisible({ timeout: 15000 });

    // Fill out the form
    await page.getByLabel(/link name/i).fill("E2E Test Link");
    await page.getByLabel(/url slug/i).fill(uniqueSlug);

    // Wait for slug availability check to complete (shows checkmark or X)
    await expect(
      page.locator(".text-green-500, .text-red-500"),
    ).toBeVisible({ timeout: 5000 });

    // Select template using label association
    // The Template label is followed by a combobox trigger
    const templateSection = page.locator("text=Template").locator("..");
    await templateSection.getByRole("combobox").click();

    // Wait for options to appear and select first template
    const templateOption = page.getByRole("option").first();
    await expect(templateOption).toBeVisible({ timeout: 5000 });
    console.log("Template option found:", await templateOption.textContent());
    await templateOption.click();

    // Small delay to ensure the value is set
    await page.waitForTimeout(500);

    // Submit the form
    const submitButton = page.getByRole("button", { name: /create link/i });
    await expect(submitButton).toBeEnabled({ timeout: 5000 });
    await submitButton.click();

    // Wait for navigation or stay on page with error
    try {
      await page.waitForURL(/\/links$/, { timeout: 20000 });
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

    // Verify a link appears
    await expect(page.getByText("E2E Test Link").first()).toBeVisible({
      timeout: 15000,
    });
  });

  test("should display created feedback link with correct details", async ({
    page,
    baseURL,
  }) => {
    // Create a link with a unique name and slug
    const timestamp = Date.now();
    const uniqueName = `Test Link ${timestamp}`;
    const uniqueSlug = `test-link-${timestamp}`;
    await page.goto(`${baseURL}/links/new`);
    await page.waitForLoadState("networkidle");

    // Wait for form to load
    await expect(
      page.getByRole("heading", { name: /create feedback link/i }),
    ).toBeVisible({ timeout: 15000 });

    await page.getByLabel(/link name/i).fill(uniqueName);
    await page.getByLabel(/url slug/i).fill(uniqueSlug);

    // Wait for slug availability check to complete
    await expect(
      page.locator(".text-green-500, .text-red-500"),
    ).toBeVisible({ timeout: 5000 });

    // Select template using label association
    const templateSection = page.locator("text=Template").locator("..");
    await templateSection.getByRole("combobox").click();

    // Wait for options to appear and select first template
    const templateOption = page.getByRole("option").first();
    await expect(templateOption).toBeVisible({ timeout: 5000 });
    await templateOption.click();

    // Small delay to ensure the value is set
    await page.waitForTimeout(500);

    const submitButton = page.getByRole("button", { name: /create link/i });
    await expect(submitButton).toBeEnabled({ timeout: 5000 });
    await submitButton.click();

    // Wait for navigation or stay on page with error
    try {
      await page.waitForURL(/\/links$/, { timeout: 30000 });
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

    // Verify the newly created link is displayed
    await expect(page.getByText(uniqueName).first()).toBeVisible({
      timeout: 15000,
    });
  });
});

test.describe("Feedback Dashboard", () => {
  test("should display dashboard with feedback stats", async ({
    page,
    baseURL,
  }) => {
    await page.goto(baseURL ?? "");

    // Check dashboard elements
    await expect(
      page.getByRole("heading", { name: "Dashboard" }),
    ).toBeVisible();
    await expect(page.getByText("Feedback Received")).toBeVisible();
    await expect(page.getByText("Feedback Sent")).toBeVisible();
  });

  test("should navigate to received feedback page", async ({
    page,
    baseURL,
  }) => {
    await page.goto(baseURL ?? "");

    // Click on Received in sidebar
    await page.getByRole("link", { name: "Received" }).click();

    await expect(page).toHaveURL(/\/feedback$/);
  });

  test("should navigate to sent feedback page", async ({ page, baseURL }) => {
    await page.goto(baseURL ?? "");

    // Click on Sent in sidebar
    await page.getByRole("link", { name: "Sent" }).click();

    await expect(page).toHaveURL(/\/feedback\/sent$/);
  });
});

test.describe("Sidebar Navigation", () => {
  test("should have main navigation structure", async ({ page, baseURL }) => {
    await page.goto(baseURL ?? "");

    // Check that we're on the dashboard
    await expect(page).toHaveURL(baseURL ?? "");
    // Page should have loaded with content
    await expect(page.locator("body")).toBeVisible();
  });

  test("should navigate to templates page", async ({ page, baseURL }) => {
    await page.goto(baseURL ?? "");
    // Use exact match to get the sidebar link, not the dashboard card
    await page.getByRole("link", { name: "Templates", exact: true }).click();
    await expect(page).toHaveURL(/\/templates$/);
  });

  test("should navigate to goals page", async ({ page, baseURL }) => {
    await page.goto(baseURL ?? "");
    await page.getByRole("link", { name: "Goals", exact: true }).click();
    await expect(page).toHaveURL(/\/goals$/);
  });
});
