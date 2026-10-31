import { test, expect, type Browser, type Page } from "@playwright/test";
import { signInByPassword } from "../../auth/utils/auth-methods";

/**
 * Process layer (feedback layers plan, P2). Seed: John administers Acme's
 * Marketing group and Jane is in it, so John leads Jane. Mike (OWNER, the
 * default storage state) and Bob (ADMIN) are the admins People/Ops map to.
 * Rita is a plain member who leads nobody.
 *
 * The lead opens a conversation and escalates it, the subject reads the shared
 * notes but never the internal one and gets an email, the admins get the
 * escalation email and see everything, and a non-lead gets 404.
 */

const AUTH_URL = process.env.AUTH_URL ?? "";
const APP_URL = process.env.PROPSTO_APP_URL ?? "";
const PASSWORD = "P4ssw0rd";
const LEAD = "john.doe@acme.com";
const SUBJECT = "jane.smith@acme.com";
const OUTSIDER = "rita.stone@acme.com";
const ADMIN = "mike.ryan@example.com";
const SUBJECT_PAGE = `${APP_URL}/org/acme/people/janesmith/conversations`;

const run = Date.now();
const SHARED_NOTE = `Missed the standup twice this week without notice ${run}`;
const INTERNAL_NOTE = `internal-only-${run}`;
const REPEATED_NOTE = `Still missing standups, review in two weeks ${run}`;
const CONSEQUENCE = `A final conversation with People ${run}`;

async function signedIn(browser: Browser, email: string): Promise<Page> {
  const context = await browser.newContext({
    storageState: { cookies: [], origins: [] },
  });
  const page = await context.newPage();
  await page.goto(AUTH_URL);
  await signInByPassword(page, email, PASSWORD);
  await page.waitForURL(`${APP_URL}/**`, { timeout: 30000 });
  return page;
}

async function outbox(
  page: Page,
  to: string,
): Promise<{ subject: string; html: string }[]> {
  const res = await page.request.get(
    `${APP_URL}/api/preview-mail?to=${encodeURIComponent(to)}`,
  );
  expect(res.ok(), `preview-mail returned ${res.status()}`).toBe(true);
  return (await res.json()) as { subject: string; html: string }[];
}

test.describe
  .serial("conversations: lead opens, subject reads, admins notified", () => {
  test("lead reaches a member from the org page and opens a conversation", async ({
    browser,
  }) => {
    const john = await signedIn(browser, LEAD);
    await john.goto(`${APP_URL}/org/acme`);
    await john
      .getByTestId("led-members")
      .getByRole("link", { name: "Conversations" })
      .first()
      .click();
    await expect(
      john.getByRole("heading", { name: "Conversations about Jane Smith" }),
    ).toBeVisible({ timeout: 15000 });

    await john.getByRole("button", { name: "Open conversation" }).click();
    const dialog = john.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByLabel("Value").selectOption({ label: "Candor" });
    // A lead cannot record the final step
    await expect(
      dialog.getByLabel("Stage").locator("option", { hasText: "Final" }),
    ).toHaveCount(0);
    await dialog.getByLabel("What the member hears").fill(SHARED_NOTE);
    await dialog.getByLabel("Internal note").fill(INTERNAL_NOTE);
    await dialog.getByRole("button", { name: "Open", exact: true }).click();
    await expect(dialog).not.toBeVisible({ timeout: 10000 });

    const card = john
      .getByTestId("conversation")
      .filter({ hasText: SHARED_NOTE });
    await expect(card).toBeVisible({ timeout: 15000 });
    await expect(card.getByText(INTERNAL_NOTE)).toBeVisible();
    await expect(card.getByText("Candor")).toBeVisible();
    await expect(card.getByText("Direct feedback")).toBeVisible();

    // Escalate: second step with a review date and a consequence
    await card.getByRole("button", { name: "Add step" }).click();
    const stepDialog = john.getByRole("dialog");
    await stepDialog
      .getByLabel("Stage")
      .selectOption({ label: "Repeated without change" });
    await stepDialog.getByLabel("What the member hears").fill(REPEATED_NOTE);
    await stepDialog.getByLabel("Review date").fill("2030-01-15");
    await stepDialog.getByLabel("If nothing changes").fill(CONSEQUENCE);
    await stepDialog.getByRole("button", { name: "Add", exact: true }).click();
    await expect(stepDialog).not.toBeVisible({ timeout: 10000 });
    await expect(card.getByText(REPEATED_NOTE)).toBeVisible({ timeout: 15000 });
    await expect(card.getByText("Repeated without change")).toBeVisible();
    await expect(card.getByText(/Review date/)).toBeVisible();
    await john.context().close();
  });

  test("subject sees the shared notes, never the internal note, and got the email", async ({
    browser,
  }) => {
    const jane = await signedIn(browser, SUBJECT);
    await jane.goto(`${APP_URL}/`);
    await jane.getByRole("link", { name: "Conversations" }).click();
    await expect(
      jane.getByRole("heading", { name: "Conversations" }),
    ).toBeVisible({ timeout: 15000 });
    const card = jane
      .getByTestId("conversation")
      .filter({ hasText: SHARED_NOTE });
    await expect(card).toBeVisible();
    await expect(card.getByText(REPEATED_NOTE)).toBeVisible();
    await expect(card.getByText(CONSEQUENCE)).toBeVisible();
    await expect(jane.getByText(INTERNAL_NOTE)).toHaveCount(0);

    // The lead's page about her is not hers to open
    await jane.goto(SUBJECT_PAGE);
    await expect(jane.getByText("Page not found")).toBeVisible();

    const emails = await outbox(jane, SUBJECT);
    const stepMails = emails.filter(e =>
      /conversation about your work/i.test(e.subject),
    );
    expect(
      stepMails.length,
      "no conversation emails for the subject",
    ).toBeGreaterThanOrEqual(2);
    for (const mail of stepMails) {
      expect(mail.html).not.toContain(INTERNAL_NOTE);
      expect(mail.html).not.toContain(SHARED_NOTE);
    }
    await jane.context().close();
  });

  test("admin got the escalation email, sees the internal note, resolves, audit lists it", async ({
    page,
  }) => {
    await page.goto(`${APP_URL}/org/acme/admin/members`);
    await page
      .getByRole("link", { name: "Conversations about Jane Smith" })
      .click();
    await expect(
      page.getByRole("heading", { name: "Conversations about Jane Smith" }),
    ).toBeVisible({ timeout: 15000 });
    const card = page
      .getByTestId("conversation")
      .filter({ hasText: SHARED_NOTE });
    await expect(card.getByText(INTERNAL_NOTE)).toBeVisible();
    // An admin may record the final step
    await card.getByRole("button", { name: "Add step" }).click();
    await expect(
      page.getByRole("dialog").getByLabel("Stage").locator("option", {
        hasText: "Final conversation",
      }),
    ).toHaveCount(1);
    await page.keyboard.press("Escape");

    const emails = await outbox(page, ADMIN);
    expect(
      emails.some(e => /recurring problem with jane smith/i.test(e.subject)),
      "no escalation email for the admin",
    ).toBe(true);

    await card.getByRole("button", { name: "Resolve" }).click();
    await expect(card.getByText("Resolved")).toBeVisible({ timeout: 15000 });
    await expect(card.getByRole("button", { name: "Add step" })).toHaveCount(0);

    await page.goto(`${APP_URL}/org/acme/admin/audit`);
    await expect(page.getByText("Conversation opened").first()).toBeVisible();
    await expect(
      page.getByText("Conversation step added").first(),
    ).toBeVisible();
    await expect(page.getByText("Conversation resolved").first()).toBeVisible();
  });

  test("a member who leads nobody gets 404 on the lead page", async ({
    browser,
  }) => {
    const rita = await signedIn(browser, OUTSIDER);
    await rita.goto(SUBJECT_PAGE);
    await expect(rita.getByText("Page not found")).toBeVisible();
    await rita.context().close();
  });
});
