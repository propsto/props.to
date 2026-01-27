import { test, expect } from "@playwright/test";

// Track console errors to catch client-side issues early
let consoleErrors: string[] = [];

test.beforeEach(async ({ page }) => {
  consoleErrors = [];
  page.on("console", msg => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  });
  page.on("pageerror", error => {
    consoleErrors.push(error.message);
  });
});

test.afterEach(async ({}, testInfo) => {
  // Only fail on errors if the test itself passed (to avoid masking the real failure)
  if (testInfo.status === "passed" && consoleErrors.length > 0) {
    throw new Error(
      `Client-side errors detected:\n${consoleErrors.join("\n")}`,
    );
  }
  // Log errors even if test failed (for debugging)
  if (consoleErrors.length > 0) {
    console.log("Console errors during test:", consoleErrors);
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
    await page.goto(`${baseURL}/links/new`);
    await page.waitForLoadState("networkidle");

    // Wait for form to load
    await expect(
      page.getByRole("heading", { name: /create feedback link/i }),
    ).toBeVisible({ timeout: 15000 });

    // Fill out the form
    await page.getByLabel(/name/i).first().fill("E2E Test Link");

    // Select template
    await page.locator('[role="combobox"]').first().click();
    await page.getByRole("option").first().click();

    // Submit the form
    await page.getByRole("button", { name: /create/i }).click();

    // Verify redirect to links page
    await page.waitForURL(/\/links$/, { timeout: 15000 });

    // Verify a link appears
    await expect(page.getByText("E2E Test Link").first()).toBeVisible({
      timeout: 15000,
    });
  });

  test("should display created feedback link with correct details", async ({
    page,
    baseURL,
  }) => {
    // Create a link with a unique name
    const uniqueName = `Test Link ${Date.now()}`;
    await page.goto(`${baseURL}/links/new`);
    await page.waitForLoadState("networkidle");

    // Wait for form to load
    await expect(
      page.getByRole("heading", { name: /create feedback link/i }),
    ).toBeVisible({ timeout: 15000 });

    await page.getByLabel(/name/i).first().fill(uniqueName);
    await page.locator('[role="combobox"]').first().click();
    await page.getByRole("option").first().click();
    await page.getByRole("button", { name: /create/i }).click();
    await page.waitForURL(/\/links$/, { timeout: 15000 });

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
