import { test, expect } from "@playwright/test";

/**
 * Dashboard stat cards must reflect real data. The "Active Links" card was
 * hardcoded to 0 in the component, so it stayed 0 no matter how many links a
 * user had. Mike is seeded with two active links, so the card must show "2".
 */
test.describe("Dashboard stats", () => {
  test("Active Links reflects the user's real link count", async ({
    page,
    baseURL,
  }) => {
    await page.goto(`${baseURL}/`);

    const activeLinksCard = page
      .locator('[data-slot="card"]')
      .filter({ hasText: "Active Links" });
    await expect(activeLinksCard).toBeVisible({ timeout: 15000 });

    // Seed gives Mike two active feedback links; a hardcoded 0 would fail here.
    await expect(activeLinksCard.getByText("2", { exact: true })).toBeVisible();
    await expect(
      activeLinksCard.getByText("Create a feedback link to get started"),
    ).toHaveCount(0);
  });
});
