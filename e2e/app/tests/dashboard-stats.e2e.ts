import { test, expect } from "@playwright/test";

/**
 * The dashboard "Active Links" card was hardcoded to 0 in the component, so it
 * stayed 0 no matter how many active links a user had. Rather than assume a
 * fixed seed count (other app tests add links to Mike without cleanup), read
 * the authoritative count from the Links page and assert the dashboard card
 * mirrors it. A hardcoded 0 fails because the Links page always shows >= 1.
 */
test.describe("Dashboard stats", () => {
  test("Active Links mirrors the Links page count", async ({
    page,
    baseURL,
  }) => {
    // The Links page renders an "Active Links (N)" heading when N > 0.
    await page.goto(`${baseURL}/links`);
    const heading = page.getByRole("heading", { name: /Active Links \(\d+\)/ });
    await expect(heading).toBeVisible({ timeout: 15000 });
    const headingText = (await heading.textContent()) ?? "";
    const activeCount = Number(/\((\d+)\)/.exec(headingText)?.[1] ?? "0");
    expect(activeCount).toBeGreaterThan(0);

    await page.goto(`${baseURL}/`);
    const card = page
      .locator('[data-slot="card"]')
      .filter({ hasText: "Active Links" });
    await expect(card).toBeVisible({ timeout: 15000 });
    await expect(
      card.getByText(String(activeCount), { exact: true }),
    ).toBeVisible();
  });
});
