import { test, expect, type Browser, type Page } from "@playwright/test";
import { signInByPassword } from "../../auth/utils/auth-methods";

/**
 * Member management (pilot readiness gate 4). Runs as mike (Acme OWNER).
 * Seed: Jane is an acme MEMBER (role changed and restored), Rita is an acme
 * MEMBER with org slug "rita.stone" and org link "Rita at Acme" (removed).
 * Removal is not undone; on a database that is not reseeded the remove step is
 * skipped and the after-removal checks still run.
 */

const AUTH_URL = process.env.AUTH_URL ?? "";
const APP_URL = process.env.PROPSTO_APP_URL ?? "";
const RITA_LINK = `${APP_URL}/acme/rita.stone/rita-acme`;

async function signedInPage(browser: Browser, email: string): Promise<Page> {
  const context = await browser.newContext({
    storageState: { cookies: [], origins: [] },
  });
  const page = await context.newPage();
  await page.goto(AUTH_URL);
  await signInByPassword(page, email, "P4ssw0rd");
  await page.waitForURL(`${APP_URL}/**`, { timeout: 30000 });
  return page;
}

test.describe.serial("members: landing page, role change, removal", () => {
  test("a plain member reaches the org landing page from the switcher", async ({
    browser,
  }) => {
    const john = await signedInPage(browser, "john.doe@acme.com");
    const sidebar = john.locator('[data-sidebar="sidebar"]');
    await sidebar
      .locator("button")
      .filter({ hasText: "Props.to" })
      .first()
      .click();
    await john.getByRole("menuitem").filter({ hasText: "Acme Inc." }).click();
    await john.waitForURL(`${APP_URL}/org/acme`);
    await expect(
      john.getByRole("heading", { name: "Your links in Acme Inc." }),
    ).toBeVisible({ timeout: 15000 });
    await expect(john.getByText("John at Acme")).toBeVisible();
    await expect(john.getByText("Organization templates")).toBeVisible();
    await john.context().close();
  });

  test("owner changes a member's role and back; cannot change their own", async ({
    page,
  }) => {
    await page.goto(`${APP_URL}/org/acme/admin/members`);
    const janeRole = page.getByLabel("Role for Jane Smith");
    await expect(janeRole).toBeVisible({ timeout: 15000 });
    await expect(page.getByLabel("Role for Mike Ryan")).toHaveCount(0);

    await janeRole.selectOption("ADMIN");
    await expect(page.getByText("Role updated")).toBeVisible();
    await page.reload();
    await expect(page.getByLabel("Role for Jane Smith")).toHaveValue("ADMIN");

    await page.getByLabel("Role for Jane Smith").selectOption("MEMBER");
    await expect(page.getByText("Role updated").first()).toBeVisible();
    await page.reload();
    await expect(page.getByLabel("Role for Jane Smith")).toHaveValue("MEMBER");
  });

  test("owner removes a member; their org URL stops resolving", async ({
    page,
  }) => {
    await page.goto(`${APP_URL}/org/acme/admin/members`);
    await expect(page.getByText("All Members")).toBeVisible({
      timeout: 15000,
    });
    const remove = page.getByRole("button", { name: "Remove Rita Stone" });
    if ((await remove.count()) > 0) {
      await page.goto(RITA_LINK);
      await expect(
        page.getByRole("heading", { name: /give feedback to rita/i }),
      ).toBeVisible();

      await page.goto(`${APP_URL}/org/acme/admin/members`);
      page.once("dialog", dialog => void dialog.accept());
      await page.getByRole("button", { name: "Remove Rita Stone" }).click();
      await expect(page.getByText("Member removed")).toBeVisible();
    }
    await page.reload();
    await expect(page.getByText("rita.stone@acme.com")).toHaveCount(0);

    await page.goto(RITA_LINK);
    await expect(page.getByText("Page not found")).toBeVisible();
    await page.goto(`${APP_URL}/acme/rita.stone`);
    await expect(page.getByText("Page not found")).toBeVisible();
  });

  test("the removed member cannot reach org pages", async ({ browser }) => {
    const rita = await signedInPage(browser, "rita.stone@acme.com");
    await rita.goto(`${APP_URL}/org/acme`);
    await expect(rita.getByText("Page not found")).toBeVisible();
    await rita.goto(`${APP_URL}/org/acme/admin/members`);
    await expect(rita.getByText("Page not found")).toBeVisible();
    await expect(rita.getByText("Jane Smith")).toHaveCount(0);

    // Her org link was paused on removal
    await rita.goto(`${APP_URL}/links`);
    await expect(rita.getByText(/paused links/i)).toBeVisible({
      timeout: 15000,
    });
    await rita.context().close();
  });
});
