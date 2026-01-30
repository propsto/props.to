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

// These tests run without authentication (public pages)
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Public Feedback Submission", () => {
  // Note: These tests use seeded data - user "mikeryan" has a feedback link "mike-props"

  test("should display user profile page", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/mikeryan`);
    await page.waitForLoadState("networkidle");

    // The profile page should show the user or their feedback links
    // Check that the page loads with meaningful content
    const heading = page.locator("h1, h2").first();
    await expect(heading).toBeVisible({ timeout: 15000 });
  });

  test("should display feedback links on user profile", async ({
    page,
    baseURL,
  }) => {
    await page.goto(`${baseURL}/mikeryan`);
    await page.waitForLoadState("networkidle");

    // mikeryan has a "Give me Props" feedback link from seed data
    await expect(page.getByText("Feedback Links")).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByText("Give me Props")).toBeVisible({
      timeout: 10000,
    });
  });

  test("should navigate to feedback link from profile", async ({
    page,
    baseURL,
  }) => {
    await page.goto(`${baseURL}/mikeryan`);
    await page.waitForLoadState("networkidle");

    // Click on the "Give me Props" link
    await page.getByText("Give me Props").click();

    // Should navigate to the feedback form page
    await expect(page).toHaveURL(/\/mikeryan\/mike-props/);

    // Verify feedback form is displayed
    await expect(
      page.getByRole("heading", { name: /give feedback/i }),
    ).toBeVisible({ timeout: 15000 });
  });

  test("should display feedback form elements", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/mikeryan/mike-props`);
    await page.waitForLoadState("networkidle");

    // Verify the feedback form page loaded (h1 has "Give Feedback to")
    await expect(
      page.getByRole("heading", { name: /give feedback/i }),
    ).toBeVisible({ timeout: 15000 });

    // Verify the feedback form card title is present (CardTitle is a div, not heading)
    await expect(page.getByText(/share your feedback/i)).toBeVisible();

    // Verify form fields are present
    await expect(page.getByLabel(/your feedback/i)).toBeVisible();
    await expect(page.getByText(/overall rating/i)).toBeVisible();

    // Verify submit button is present
    await expect(
      page.getByRole("button", { name: /submit feedback/i }),
    ).toBeVisible();
  });

  test("should submit feedback through public link", async ({
    page,
    baseURL,
  }) => {
    await page.goto(`${baseURL}/mikeryan/mike-props`);
    await page.waitForLoadState("networkidle");

    // Wait for form to load (h1 has "Give Feedback to")
    await expect(
      page.getByRole("heading", { name: /give feedback/i }),
    ).toBeVisible({ timeout: 15000 });

    // Fill out feedback text
    const feedbackTextarea = page.getByLabel(/your feedback/i);
    await feedbackTextarea.fill(
      "Great work on the recent project! Your attention to detail and collaboration skills are excellent.",
    );

    // Select a rating (click on rating 5)
    const ratingButtons = page.locator(
      'button:has-text("5"):not([type="submit"])',
    );
    await ratingButtons.first().click();

    // Optionally fill in name (not anonymous)
    const nameInput = page.getByLabel(/your name/i);
    if (await nameInput.isVisible()) {
      await nameInput.fill("E2E Test User");
    }

    // Submit the form
    const submitButton = page.getByRole("button", { name: /submit feedback/i });
    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    // Wait for navigation to thank you page
    await page.waitForURL(/\/mikeryan\/mike-props\/thanks/, { timeout: 20000 });

    // Verify thank you page (CardTitle is a div, not heading)
    await expect(page.getByText(/thank you/i).first()).toBeVisible({
      timeout: 15000,
    });
  });

  test("should handle non-existent user gracefully", async ({
    page,
    baseURL,
  }) => {
    await page.goto(`${baseURL}/nonexistentuser12345`);

    // Should show 404 or not found page
    // The app returns notFound() which shows a 404 page
    const pageContent = await page.textContent("body");
    expect(pageContent).toBeTruthy();

    // Check for 404 indicators
    const is404 =
      pageContent?.toLowerCase().includes("not found") ||
      pageContent?.includes("404") ||
      (await page.title()).toLowerCase().includes("not found");

    expect(is404).toBeTruthy();
  });

  test("should handle non-existent feedback link gracefully", async ({
    page,
    baseURL,
  }) => {
    await page.goto(`${baseURL}/mikeryan/nonexistentlink12345`);

    // Should show 404 or not found page
    const pageContent = await page.textContent("body");
    expect(pageContent).toBeTruthy();

    // Check for 404 indicators
    const is404 =
      pageContent?.toLowerCase().includes("not found") ||
      pageContent?.includes("404") ||
      (await page.title()).toLowerCase().includes("not found");

    expect(is404).toBeTruthy();
  });
});

test.describe("Public Feedback Form Validation", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("should require feedback text before submission", async ({
    page,
    baseURL,
  }) => {
    await page.goto(`${baseURL}/mikeryan/mike-props`);
    await page.waitForLoadState("networkidle");

    // Wait for form to load (h1 has "Give Feedback to")
    await expect(
      page.getByRole("heading", { name: /give feedback/i }),
    ).toBeVisible({ timeout: 15000 });

    // Try to submit without filling feedback
    const submitButton = page.getByRole("button", { name: /submit feedback/i });
    await submitButton.click();

    // Should show validation error
    await expect(page.getByText(/please provide your feedback/i)).toBeVisible({
      timeout: 5000,
    });

    // Should still be on the same page (not navigated to thanks)
    expect(page.url()).toContain("/mikeryan/mike-props");
    expect(page.url()).not.toContain("/thanks");
  });
});

test.describe("Thank You Page", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("should display thank you page content", async ({ page, baseURL }) => {
    // Navigate directly to a thanks path
    await page.goto(`${baseURL}/mikeryan/mike-props/thanks`);
    await page.waitForLoadState("networkidle");

    // The page should load successfully with thank you content
    await expect(page.locator("body")).toBeVisible();

    // Check for thank you title (CardTitle is a div, not heading)
    await expect(page.getByText(/thank you/i).first()).toBeVisible({
      timeout: 15000,
    });

    // Check for confirmation message
    await expect(
      page.getByText(/feedback has been submitted successfully/i),
    ).toBeVisible();

    // Check for "Learn More" link
    await expect(
      page.getByRole("link", { name: /learn more about props\.to/i }),
    ).toBeVisible();
  });
});

test.describe("Anonymous Feedback Toggle", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("should toggle anonymous submission", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/mikeryan/mike-props`);
    await page.waitForLoadState("networkidle");

    // Wait for form to load (h1 has "Give Feedback to")
    await expect(
      page.getByRole("heading", { name: /give feedback/i }),
    ).toBeVisible({ timeout: 15000 });

    // Check if anonymous toggle is visible
    const anonymousToggle = page.getByRole("switch");
    if (await anonymousToggle.isVisible()) {
      // Initially, name/email fields should be visible (non-anonymous by default)
      const nameField = page.getByLabel(/your name/i);
      await expect(nameField).toBeVisible();

      // Toggle to anonymous
      await anonymousToggle.click();

      // Name/email fields should now be hidden
      await expect(nameField).not.toBeVisible({ timeout: 5000 });

      // Toggle back to non-anonymous
      await anonymousToggle.click();

      // Name/email fields should be visible again
      await expect(nameField).toBeVisible({ timeout: 5000 });
    }
  });
});
