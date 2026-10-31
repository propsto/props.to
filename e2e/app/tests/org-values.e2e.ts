import { test, expect } from "@playwright/test";

/**
 * Values layer admin (feedback layers plan, V1). Runs as mike (Acme OWNER).
 * Seed: Acme has three demo values (Ownership, Candor, Craft). The test works
 * on its own value so the seeded order is left as it was.
 */

test.describe("Organization values admin", () => {
  const orgSlug = "acme";

  test("admin creates, renames, reorders and deletes a value", async ({
    page,
    baseURL,
  }) => {
    await page.goto(`${baseURL}/org/${orgSlug}/admin`);
    const adminNav = page.locator("nav").filter({ hasText: "Overview" });
    await adminNav.getByRole("link", { name: /values/i }).click();

    await expect(page.getByRole("heading", { name: "Values" })).toBeVisible({
      timeout: 15000,
    });
    const rows = page.locator("ol > li");
    await expect(rows.filter({ hasText: "Ownership" })).toBeVisible();

    const name = `Test Value ${Date.now()}`;
    const renamed = `${name} renamed`;

    // Create: appended at the end of the list
    await page.getByRole("button", { name: /new value/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 5000 });
    await page.getByLabel("Name", { exact: true }).fill(name);
    await page
      .getByLabel("Description", { exact: true })
      .fill("Created by E2E");
    await page.getByRole("button", { name: "Create Value" }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 5000 });
    await expect(rows.last()).toContainText(name, { timeout: 5000 });

    // Rename
    await page.getByRole("button", { name: `Edit ${name}` }).click();
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 5000 });
    await page.getByLabel("Name", { exact: true }).fill(renamed);
    await page.getByRole("button", { name: "Save Changes" }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 5000 });
    await expect(rows.last()).toContainText(renamed, { timeout: 5000 });

    // Reorder: move it up one place
    const count = await rows.count();
    await page.getByRole("button", { name: `Move ${renamed} up` }).click();
    await expect(rows.nth(count - 2)).toContainText(renamed, {
      timeout: 5000,
    });

    // Delete (unreferenced, so allowed)
    await page.getByRole("button", { name: `Delete ${renamed}` }).click();
    await expect(
      page.getByRole("heading", { name: "Delete Value" }),
    ).toBeVisible({ timeout: 5000 });
    await page.getByRole("button", { name: /^delete$/i }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 5000 });
    await expect(rows.filter({ hasText: renamed })).toHaveCount(0, {
      timeout: 5000,
    });
  });
});
