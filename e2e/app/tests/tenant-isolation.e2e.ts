import { test, expect, type Page } from "@playwright/test";
import { signInByPassword } from "../../auth/utils/auth-methods";

/**
 * Tenant isolation (pilot readiness gate 1).
 * Seed: Acme (mike OWNER, john MEMBER) and Globex (carol OWNER, john ADMIN).
 * Org-scoped links: "John at Acme" (acme) and "Carol at Globex" (globex).
 * Mike's personal link "Give me Props" belongs to no org.
 */

const AUTH_URL = process.env.AUTH_URL ?? "";
const APP_URL = process.env.PROPSTO_APP_URL ?? "";

async function signInAs(page: Page, email: string): Promise<void> {
  await page.goto(AUTH_URL);
  await signInByPassword(page, email, "P4ssw0rd");
  await page.waitForURL(`${APP_URL}/**`, { timeout: 30000 });
}

test.describe("org admin links are scoped to the org", () => {
  test("acme owner sees acme links only", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/org/acme/admin/links`);
    await expect(page.getByText("John at Acme")).toBeVisible();
    await expect(page.getByText("Carol at Globex")).toHaveCount(0);
    await expect(page.getByText("Give me Props")).toHaveCount(0);
  });
});

test.describe("signed in as another tenant", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("globex owner sees globex links only and cannot open acme admin", async ({
    page,
  }) => {
    await signInAs(page, "carol.white@globex.com");

    await page.goto(`${APP_URL}/org/globex/admin/links`);
    await expect(page.getByText("Carol at Globex")).toBeVisible();
    await expect(page.getByText("John at Acme")).toHaveCount(0);

    const res = await page.goto(`${APP_URL}/org/acme/admin/links`);
    const blocked =
      res?.status() === 404 || !page.url().includes("/org/acme/admin");
    expect(
      blocked,
      `expected acme admin to be blocked, got ${res?.status()} at ${page.url()}`,
    ).toBe(true);
    await expect(page.getByText("John at Acme")).toHaveCount(0);
  });

  test("dual member (acme MEMBER, globex ADMIN) does not leak acme links into globex", async ({
    page,
  }) => {
    await signInAs(page, "john.doe@acme.com");

    await page.goto(`${APP_URL}/org/globex/admin/links`);
    await expect(page.getByText("Carol at Globex")).toBeVisible();
    // John's own acme link must stay out of the globex admin view
    await expect(page.getByText("John at Acme")).toHaveCount(0);

    // A plain member cannot open the acme admin area either
    const res = await page.goto(`${APP_URL}/org/acme/admin/links`);
    const blocked =
      res?.status() === 404 || !page.url().includes("/org/acme/admin");
    expect(
      blocked,
      `expected acme admin to be blocked for a member, got ${res?.status()} at ${page.url()}`,
    ).toBe(true);
  });
});
