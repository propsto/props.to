import { test, expect, type Page } from "@playwright/test";

/**
 * Values layer admin (feedback layers plan, V1). Runs as mike (Acme OWNER).
 * Seed: Acme has three demo values (Ownership, Candor, Craft). The tests work
 * on their own values so the seeded order is left as it was, and each starts
 * by deleting what an earlier, failed attempt left behind.
 */

const orgSlug = "acme";
const PREFIX = "E2E Value";
const PICKER = "Which values did they show?";
// An Acme member link whose form shows the value picker
const PUBLIC_FORM = "/acme/john.doe/john-acme";

async function openValuesAdmin(page: Page, baseURL?: string): Promise<void> {
  await page.goto(`${baseURL}/org/${orgSlug}/admin/values`);
  await expect(page.getByRole("heading", { name: "Values" })).toBeVisible({
    timeout: 15000,
  });
}

// Delete every value an earlier attempt of these tests created (unreferenced)
async function deleteLeftovers(page: Page): Promise<void> {
  const archived = page.locator("details").filter({ hasText: "Archived" });
  if (await archived.count()) {
    await archived.locator("summary").click();
  }
  const leftovers = page
    .locator("ol > li")
    .filter({ hasText: new RegExp(`^${PREFIX}`) });
  while (await leftovers.count()) {
    const name = (
      await leftovers.first().locator(".font-medium").innerText()
    ).trim();
    await page.getByRole("button", { name: `Delete ${name}` }).click();
    await page.getByRole("button", { name: /^delete$/i }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 5000 });
    await expect(page.locator("ol > li").filter({ hasText: name })).toHaveCount(
      0,
      { timeout: 5000 },
    );
  }
}

async function createValue(page: Page, name: string): Promise<void> {
  await page.getByRole("button", { name: /new value/i }).click();
  await expect(page.getByRole("dialog")).toBeVisible({ timeout: 5000 });
  await page.getByLabel("Name", { exact: true }).fill(name);
  await page.getByLabel("Description", { exact: true }).fill("Created by E2E");
  await page.getByRole("button", { name: "Create Value" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 5000 });
}

test.describe("Organization values admin", () => {
  // Both tests clean up the same prefix, so they must not run side by side
  test.describe.configure({ mode: "serial" });

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
    await deleteLeftovers(page);
    const rows = page.getByTestId("active-values").locator(":scope > li");
    await expect(rows.filter({ hasText: "Ownership" })).toBeVisible();

    const name = `${PREFIX} ${Date.now()}`;
    const renamed = `${name} renamed`;

    // Create: appended at the end of the list
    await createValue(page, name);
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

  test("archiving a value hides it on the public form and restoring brings it back", async ({
    page,
    baseURL,
  }) => {
    await openValuesAdmin(page, baseURL);
    await deleteLeftovers(page);

    const name = `${PREFIX} ${Date.now()}`;
    await createValue(page, name);
    const active = page.getByTestId("active-values");
    await expect(active.locator(":scope > li").last()).toContainText(name, {
      timeout: 5000,
    });

    // Active: the public form offers it
    await page.goto(`${baseURL}${PUBLIC_FORM}`);
    await expect(page.getByText(PICKER)).toBeVisible({ timeout: 15000 });
    await expect(page.getByLabel(name)).toBeVisible();

    // Archive: it moves to the archived section and leaves the public form
    await openValuesAdmin(page, baseURL);
    await page.getByRole("button", { name: `Archive ${name}` }).click();
    await expect(
      active.locator(":scope > li").filter({ hasText: name }),
    ).toHaveCount(0, { timeout: 5000 });
    await page.locator("summary").filter({ hasText: "Archived" }).click();
    await expect(
      page.getByTestId("archived-values").locator(":scope > li").filter({
        hasText: name,
      }),
    ).toBeVisible({ timeout: 5000 });

    await page.goto(`${baseURL}${PUBLIC_FORM}`);
    await expect(page.getByText(PICKER)).toBeVisible({ timeout: 15000 });
    await expect(page.getByLabel("Ownership")).toBeVisible();
    await expect(page.getByLabel(name)).toHaveCount(0);

    // Restore: back at the end of the active list and on the public form
    await openValuesAdmin(page, baseURL);
    await page.locator("summary").filter({ hasText: "Archived" }).click();
    await page.getByRole("button", { name: `Restore ${name}` }).click();
    await expect(active.locator(":scope > li").last()).toContainText(name, {
      timeout: 5000,
    });

    await page.goto(`${baseURL}${PUBLIC_FORM}`);
    await expect(page.getByLabel(name)).toBeVisible({ timeout: 15000 });

    // Clean up
    await openValuesAdmin(page, baseURL);
    await deleteLeftovers(page);
  });
});
