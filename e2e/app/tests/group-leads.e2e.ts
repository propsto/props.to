import { test, expect } from "@playwright/test";
import { signInByPassword } from "../../auth/utils/auth-methods";

/**
 * An org admin (Mike, the default storage state) makes someone a group lead
 * from Manage Members, and the lead then sees the group's members under
 * "People you lead". Jane leads John in a new group: both are onboarded seed
 * users that no other spec removes, and the conversations spec only needs
 * John to lead Jane and Rita to lead nobody.
 */

const AUTH_URL = process.env.AUTH_URL ?? "";
const APP_URL = process.env.PROPSTO_APP_URL ?? "";
const group = `Lead Team ${Date.now()}`;

test("admin assigns a group lead who then leads its members", async ({
  page,
  browser,
}) => {
  // Two sign-ins and a dialog round trip outgrow the default 30s
  test.setTimeout(90000);
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
  for (const name of ["John Doe", "Jane Smith"]) {
    await dialog
      .locator("label")
      .filter({ hasText: name })
      .getByRole("checkbox")
      .click();
  }
  await dialog.getByRole("button", { name: "Lead: Jane" }).click();
  await dialog.getByRole("button", { name: /save changes/i }).click();
  await expect(dialog).toBeHidden({ timeout: 15000 });
  await expect(row).toContainText("Lead: Jane", { timeout: 15000 });

  const context = await browser.newContext({
    storageState: { cookies: [], origins: [] },
  });
  const jane = await context.newPage();
  await jane.goto(AUTH_URL);
  await signInByPassword(jane, "jane.jones@acme.com", "P4ssw0rd");
  await jane.waitForURL(`${APP_URL}/**`, { timeout: 30000 });
  await jane.goto(`${APP_URL}/org/acme`);
  await expect(jane.getByTestId("led-members")).toContainText("John Doe", {
    timeout: 15000,
  });
  await context.close();
});
