import { test, expect } from "@playwright/test";

/**
 * Levels layer admin (feedback layers plan, L1). Runs as mike (Acme OWNER).
 * Seed: Acme has three demo levels (Associate, Senior, Lead) and John is Senior.
 * The test creates its own level and assigns it to Bob, then clears Bob's level
 * again. Levels have no delete yet, so the created level stays behind.
 */

test.describe("Organization levels admin", () => {
  const orgSlug = "acme";

  test("admin creates and reorders a level, then assigns it to a member", async ({
    page,
    baseURL,
  }) => {
    await page.goto(`${baseURL}/org/${orgSlug}/admin`);
    const adminNav = page.locator("nav").filter({ hasText: "Overview" });
    await adminNav.getByRole("link", { name: /levels/i }).click();

    await expect(page.getByRole("heading", { name: "Levels" })).toBeVisible({
      timeout: 15000,
    });
    const rows = page.locator("ol > li");
    await expect(rows.filter({ hasText: "Senior" })).toBeVisible();

    const name = `Test Level ${Date.now()}`;

    // Create: appended at the end of the list
    await page.getByRole("button", { name: /new level/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 5000 });
    await page.getByLabel("Name").fill(name);
    await page.getByLabel("Summary").fill("Created by E2E");
    await page.getByRole("button", { name: "Create Level" }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 5000 });
    await expect(rows.last()).toContainText(name, { timeout: 5000 });

    // Reorder: move it up one place
    const count = await rows.count();
    await page.getByRole("button", { name: `Move ${name} up` }).click();
    await expect(rows.nth(count - 2)).toContainText(name, { timeout: 5000 });

    // Seeded assignment shows on the members page
    await adminNav.getByRole("link", { name: /members/i }).click();
    await expect(
      page.getByLabel("Level for John Doe").locator("option:checked"),
    ).toHaveText("Senior", { timeout: 15000 });

    // Assign the new level to Bob; the row keeps it after a reload
    const bobLevel = page.getByLabel("Level for Bob Jones");
    await bobLevel.selectOption({ label: name });
    await expect(page.getByText("Level updated")).toBeVisible({
      timeout: 5000,
    });
    await page.reload();
    await expect(
      page.getByLabel("Level for Bob Jones").locator("option:checked"),
    ).toHaveText(name, { timeout: 15000 });

    // Clear it again so reruns start from the seeded state
    await page.getByLabel("Level for Bob Jones").selectOption({ value: "" });
    await expect(page.getByText("Level updated").first()).toBeVisible({
      timeout: 5000,
    });
  });
});
