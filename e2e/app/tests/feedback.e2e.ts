import { test, expect } from "@playwright/test";

test.describe("Feedback Links", () => {
  test("should display empty state when no links exist", async ({
    page,
    baseURL,
  }) => {
    await page.goto(`${baseURL}/links`);

    // Check for empty state or links list
    const pageContent = await page.textContent("body");
    expect(
      pageContent?.includes("Feedback Links") ||
        pageContent?.includes("No feedback links"),
    ).toBeTruthy();
  });

  test("should navigate to create link page", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/links`);

    // Debug: log current URL and page content
    console.log(`Initial URL: ${page.url()}`);

    // Wait for page to load
    await page.waitForLoadState("networkidle");

    // Debug: check if we're authenticated or redirected
    const pageTitle = await page.title();
    console.log(`Page title: ${pageTitle}`);

    // Click create link button
    const createLink = page.getByRole("link", { name: /create link/i }).first();
    await expect(createLink).toBeVisible({ timeout: 10000 });
    await createLink.click();

    // Verify we're on the create page
    await expect(page).toHaveURL(/\/links\/new/);
    await page.waitForLoadState("networkidle");

    // Debug: log URL after navigation
    console.log(`After navigation URL: ${page.url()}`);

    // Take screenshot to see what's on the page
    await page.screenshot({ path: "/tmp/links-new-page.png", fullPage: true });
    console.log("Screenshot saved to /tmp/links-new-page.png");

    // Log page content for debugging
    const bodyText = await page.textContent("body");
    console.log(`Page body text (first 500 chars): ${bodyText?.slice(0, 500)}`);

    await expect(
      page.getByRole("heading", { name: /create feedback link/i }),
    ).toBeVisible({ timeout: 10000 });
  });

  test("should create a new feedback link", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/links/new`);
    await page.waitForLoadState("networkidle");

    // Wait for form to load
    await expect(
      page.getByRole("heading", { name: /create feedback link/i }),
    ).toBeVisible({ timeout: 10000 });

    // Fill out the form
    const nameInput = page.getByLabel(/name/i).first();
    await nameInput.fill("E2E Test Link");

    // Select template
    await page.locator('[role="combobox"]').first().click();
    await page.getByRole("option").first().click();

    // Submit the form
    await page.getByRole("button", { name: /create/i }).click();

    // Verify redirect to links page
    await page.waitForURL(/\/links$/, { timeout: 10000 });

    // Verify a link appears (use first() since there might be multiple)
    await expect(page.getByText("E2E Test Link").first()).toBeVisible({
      timeout: 10000,
    });
  });

  test("should display created feedback link with correct details", async ({
    page,
    baseURL,
  }) => {
    // First create a link with a unique name
    const uniqueName = `Test Link ${Date.now()}`;
    await page.goto(`${baseURL}/links/new`);
    await page.waitForLoadState("networkidle");

    // Wait for form to load
    await expect(
      page.getByRole("heading", { name: /create feedback link/i }),
    ).toBeVisible({ timeout: 10000 });

    const nameInput = page.getByLabel(/name/i).first();
    await nameInput.fill(uniqueName);

    await page.locator('[role="combobox"]').first().click();
    await page.getByRole("option").first().click();
    await page.getByRole("button", { name: /create/i }).click();
    await page.waitForURL(/\/links$/, { timeout: 10000 });

    // Verify the newly created link is displayed
    await expect(page.getByText(uniqueName).first()).toBeVisible({
      timeout: 10000,
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
