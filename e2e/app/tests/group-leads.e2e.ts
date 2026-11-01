import { test, expect } from "@playwright/test";
import { signInByPassword } from "../../auth/utils/auth-methods";

/**
 * An org admin (Mike, the default storage state) makes someone a group lead
 * from Manage Members, and the lead then sees the group's members under
 * "People you lead". Bob leads Rita here; Rita stays a non-lead for the
 * conversations spec.
 */

const AUTH_URL = process.env.AUTH_URL ?? "";
const APP_URL = process.env.PROPSTO_APP_URL ?? "";
const group = `Lead Team ${Date.now()}`;

test("admin assigns a group lead who then leads its members", async ({
  page,
  browser,
}) => {
  await page.goto(`${APP_URL}/org/acme/admin/groups`);
  await page.getByRole("button", { name: /create group/i }).click();
  const create = page.getByRole("dialog");
  await create.getByLabel("Name").fill(group);
  await create
    .getByRole("button", { name: /create/i })
    .last()
    .click();
  await expect(create).toBeHidden({ timeout: 15000 });

  const row = page.getByRole("row").filter({ hasText: group });
  await row.getByRole("button", { name: "Actions" }).click();
  await page.getByRole("menuitem", { name: "Manage Members" }).click();

  const dialog = page.getByRole("dialog");
  for (const name of ["Bob Jones", "Rita Stone"]) {
    await dialog
      .locator("label")
      .filter({ hasText: name })
      .getByRole("checkbox")
      .click();
  }
  await dialog.getByRole("button", { name: "Lead: Bob" }).click();
  await dialog.getByRole("button", { name: /save changes/i }).click();
  await expect(dialog).toBeHidden({ timeout: 15000 });
  await expect(row).toContainText("Lead: Bob", { timeout: 15000 });

  const context = await browser.newContext({
    storageState: { cookies: [], origins: [] },
  });
  const bob = await context.newPage();
  await bob.goto(AUTH_URL);
  await signInByPassword(bob, "bob.jones@acme.com", "P4ssw0rd");
  await bob.waitForURL(`${APP_URL}/**`, { timeout: 30000 });
  await bob.goto(`${APP_URL}/org/acme`);
  await expect(bob.getByTestId("led-members")).toContainText("Rita Stone", {
    timeout: 15000,
  });
  await context.close();
});
