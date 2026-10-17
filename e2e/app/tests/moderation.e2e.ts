import { test, expect, type Browser, type Page } from "@playwright/test";
import { signInByPassword } from "../../auth/utils/auth-methods";

/**
 * Moderation queue (pilot readiness gate 4). Seed holds two PENDING_MODERATION
 * acme submissions to John ("Pending feedback to approve" / "... to reject").
 * Runs as mike (Acme OWNER); John is a plain acme member and the recipient.
 * Not idempotent on a database that is not reseeded (previews reseed per build).
 */

const AUTH_URL = process.env.AUTH_URL ?? "";
const APP_URL = process.env.PROPSTO_APP_URL ?? "";
const RECIPIENT = "john.doe@acme.com";
const TO_APPROVE = "Pending feedback to approve";
const TO_REJECT = "Pending feedback to reject";

async function recipientPage(browser: Browser): Promise<Page> {
  const context = await browser.newContext({
    storageState: { cookies: [], origins: [] },
  });
  const page = await context.newPage();
  await page.goto(AUTH_URL);
  await signInByPassword(page, RECIPIENT, "P4ssw0rd");
  await page.waitForURL(`${APP_URL}/**`, { timeout: 30000 });
  return page;
}

function pendingCard(page: Page, text: string) {
  return page.getByTestId("pending-feedback").filter({ hasText: text });
}

test.describe
  .serial("moderation: pending is hidden until approved, approval notifies", () => {
  test("recipient does not see pending feedback", async ({ browser }) => {
    const john = await recipientPage(browser);
    await john.goto(`${APP_URL}/feedback`);
    await expect(
      john.getByRole("heading", { name: "Feedback Received" }),
    ).toBeVisible({ timeout: 15000 });
    await expect(john.getByText(TO_APPROVE)).toHaveCount(0);
    await expect(john.getByText(TO_REJECT)).toHaveCount(0);
    await john.context().close();
  });

  test("admin approves one and rejects the other", async ({ page }) => {
    await page.goto(`${APP_URL}/org/acme/admin/moderation`);
    await expect(pendingCard(page, TO_APPROVE)).toBeVisible({
      timeout: 15000,
    });

    await pendingCard(page, TO_APPROVE)
      .getByRole("button", { name: "Approve" })
      .click();
    await expect(pendingCard(page, TO_APPROVE)).toHaveCount(0, {
      timeout: 15000,
    });

    await pendingCard(page, TO_REJECT)
      .getByRole("button", { name: "Reject" })
      .click();
    await expect(pendingCard(page, TO_REJECT)).toHaveCount(0, {
      timeout: 15000,
    });

    await page.goto(`${APP_URL}/org/acme/admin/audit`);
    await expect(page.getByText("Feedback approved").first()).toBeVisible();
    await expect(page.getByText("Feedback rejected").first()).toBeVisible();
  });

  test("recipient sees only the approved one and got the email", async ({
    browser,
  }) => {
    const john = await recipientPage(browser);
    await john.goto(`${APP_URL}/feedback`);
    await expect(john.getByText(TO_APPROVE)).toBeVisible({ timeout: 15000 });
    await expect(john.getByText(TO_REJECT)).toHaveCount(0);

    const res = await john.request.get(
      `${APP_URL}/api/preview-mail?to=${encodeURIComponent(RECIPIENT)}`,
    );
    expect(res.ok(), `preview-mail returned ${res.status()}`).toBe(true);
    const emails = (await res.json()) as { subject: string }[];
    expect(
      emails.some(e => /sent you feedback/i.test(e.subject)),
      "no feedback notification in the outbox",
    ).toBe(true);
    await john.context().close();
  });
});
