import { test, expect } from "@playwright/test";
import { signInByPassword } from "../../auth/utils/auth-methods";

/**
 * Levels layer rubric and expectations (feedback layers plan, L2).
 * Seed: Acme's Senior level has a rubric (Scope, Collaboration) and a Candor
 * expectation; John is Senior. Every seeded org is members-only, so an outsider
 * never reaches an org form here: the outsider check below asserts the refusal,
 * and showsRecipientLevel's unit test covers an outsider on an open form.
 */

const AUTH_URL = process.env.AUTH_URL ?? "";
const APP_URL = process.env.PROPSTO_APP_URL ?? "";
const PANEL = "What we expect at this level";
const CANDOR_AT_SENIOR =
  "Raises risks in the open before they become surprises";

test.describe("Level expectations for org members", () => {
  test("admin sees the seeded rubric and expectations on the level page", async ({
    page,
    baseURL,
  }) => {
    await page.goto(`${baseURL}/org/acme/admin/levels`);
    await page.getByRole("link", { name: "Senior", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Senior" })).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByLabel("Section 1 title")).toHaveValue("Scope");
    await expect(page.getByLabel("Candor")).toHaveValue(CANDOR_AT_SENIOR);
  });

  test("form shows the recipient's level expectation to a member", async ({
    page,
    baseURL,
  }) => {
    // Runs as mike, an Acme member
    await page.goto(`${baseURL}/acme/john.doe/john-acme`);
    await page.getByText(PANEL).click();
    await expect(
      page.getByText("Owns problems end to end and unblocks others"),
    ).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(CANDOR_AT_SENIOR)).toHaveCount(0);

    await page.getByLabel("Candor").check();
    await expect(page.getByText(CANDOR_AT_SENIOR)).toBeVisible();
  });
});

test.describe("Level rubric for the member and outsiders", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("member sees their own level and rubric on the org page", async ({
    page,
  }) => {
    await page.goto(AUTH_URL);
    await signInByPassword(page, "john.doe@acme.com", "P4ssw0rd");
    await page.waitForURL(`${APP_URL}/**`, { timeout: 30000 });

    await page.goto(`${APP_URL}/org/acme`);
    await expect(page.getByText("Your level: Senior")).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByText("Scope", { exact: true })).toBeVisible();
    await expect(
      page.getByText(
        "Leads a project from problem to launch without hand-holding",
      ),
    ).toBeVisible();
  });

  test("outsider never sees the level panel", async ({ page }) => {
    // Signed out, so never an Acme member whatever other specs change
    await page.goto(`${APP_URL}/acme/john.doe/john-acme`);
    await expect(
      page.getByRole("link", { name: /sign in to continue/i }),
    ).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(PANEL)).toHaveCount(0);
    await expect(page.getByText(CANDOR_AT_SENIOR)).toHaveCount(0);
  });
});
