import { test, expect } from "@playwright/test";

// Track JavaScript errors to catch client-side issues early
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

test.describe("Hidden Feedback Links - Dashboard", () => {
  test("should create a hidden feedback link", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/links/new`);
    await page.waitForLoadState("networkidle");

    // Wait for form to load
    await expect(
      page.getByRole("heading", { name: /create feedback link/i }),
    ).toBeVisible({ timeout: 15000 });

    // Fill out the form
    const uniqueName = `Hidden Test Link ${Date.now()}`;
    await page.getByLabel(/link name/i).fill(uniqueName);

    // Select template
    const templateSection = page.locator("text=Template").locator("..");
    await templateSection.getByRole("combobox").click();
    const templateOption = page.getByRole("option").first();
    await expect(templateOption).toBeVisible({ timeout: 5000 });
    await templateOption.click();
    await page.waitForTimeout(500);

    // Toggle the hidden switch ON
    const hiddenSwitch = page.getByRole("switch");
    await expect(hiddenSwitch).toBeVisible();
    await hiddenSwitch.click();

    // Verify switch is checked
    await expect(hiddenSwitch).toBeChecked();

    // Submit the form
    const submitButton = page.getByRole("button", { name: /create link/i });
    await expect(submitButton).toBeEnabled({ timeout: 5000 });
    await submitButton.click();

    // Wait for navigation to links page (may have query params or trailing slash)
    await page.waitForURL(/\/links(?:\/|\?|$)/, { timeout: 20000 });

    // Verify the link appears with the Hidden badge
    await expect(page.getByText(uniqueName).first()).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByText("Hidden").first()).toBeVisible({
      timeout: 5000,
    });
  });

  test("should display Hidden badge on hidden links in dashboard", async ({
    page,
    baseURL,
  }) => {
    await page.goto(`${baseURL}/links`);
    await page.waitForLoadState("networkidle");

    // Verify the heading is visible
    await expect(
      page.getByRole("heading", { name: /feedback links/i }),
    ).toBeVisible({ timeout: 15000 });

    // The seeded hidden link "Private 1:1 Feedback" should show the Hidden badge
    // Look for any link card that has the Hidden badge
    const hiddenBadges = page.locator("text=Hidden");
    const count = await hiddenBadges.count();

    // There should be at least one hidden link (from seed or created in previous test)
    expect(count).toBeGreaterThan(0);
  });
});

test.describe("Hidden Feedback Links - Public Profile", () => {
  // These tests run without authentication (public pages)
  test.use({ storageState: { cookies: [], origins: [] } });

  test("should NOT display hidden links on user public profile", async ({
    page,
    baseURL,
  }) => {
    await page.goto(`${baseURL}/mikeryan`);
    await page.waitForLoadState("networkidle");

    // The profile page should load
    const heading = page.locator("h1, h2").first();
    await expect(heading).toBeVisible({ timeout: 15000 });

    // Check that the Feedback Links section is visible
    await expect(page.getByText("Feedback Links")).toBeVisible({
      timeout: 15000,
    });

    // The visible link "Give me Props" should be shown
    await expect(page.getByText("Give me Props")).toBeVisible({
      timeout: 10000,
    });

    // The hidden link "Private 1:1 Feedback" should NOT be shown
    await expect(page.getByText("Private 1:1 Feedback")).not.toBeVisible();
  });

  test("should still allow access to hidden link via direct URL", async ({
    page,
    baseURL,
  }) => {
    // Navigate directly to the hidden feedback link
    await page.goto(`${baseURL}/mikeryan/mike-hidden`);
    await page.waitForLoadState("networkidle");

    // The feedback form should be accessible
    await expect(
      page.getByRole("heading", { name: /give feedback/i }),
    ).toBeVisible({ timeout: 15000 });

    // Verify the feedback form is functional
    await expect(page.getByText(/share your feedback/i)).toBeVisible();
    await expect(page.getByLabel(/your feedback/i)).toBeVisible();
  });

  test("should be able to submit feedback through hidden link", async ({
    page,
    baseURL,
  }) => {
    await page.goto(`${baseURL}/mikeryan/mike-hidden`);
    await page.waitForLoadState("networkidle");

    // Wait for form to load
    await expect(
      page.getByRole("heading", { name: /give feedback/i }),
    ).toBeVisible({ timeout: 15000 });

    // Fill out feedback text
    const feedbackTextarea = page.getByLabel(/your feedback/i);
    await feedbackTextarea.fill(
      "This is feedback submitted through a hidden link for testing purposes.",
    );

    // Select a rating
    const ratingButtons = page.locator(
      'button:has-text("5"):not([type="submit"])',
    );
    await ratingButtons.first().click();

    // Submit the form
    const submitButton = page.getByRole("button", { name: /submit feedback/i });
    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    // Wait for navigation to thank you page
    await page.waitForURL(/\/mikeryan\/mike-hidden\/thanks/, {
      timeout: 20000,
    });

    // Verify thank you page
    await expect(page.getByText(/thank you/i).first()).toBeVisible({
      timeout: 15000,
    });
  });
});
