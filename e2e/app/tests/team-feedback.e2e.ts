import { test, expect, type Browser, type Page } from "@playwright/test";
import { signInByPassword } from "../../auth/utils/auth-methods";

/**
 * Team feedback (team links + subgroups). Marketing is a PUBLIC acme group
 * with a team link (/acme/marketing/team) whose recipient is the group itself,
 * a PUBLIC subgroup (Launch Crew), and John as its lead (GroupAdmin). An
 * outsider's submission waits for moderation; once approved it shows on the
 * group page for members, lands on no member's record, and notifies the lead.
 * Runs as mike (Acme OWNER) in the default context.
 */

const AUTH_URL = process.env.AUTH_URL ?? "";
const APP_URL = process.env.PROPSTO_APP_URL ?? "";
const FIELD = /what do you appreciate about this person/i;

async function memberPage(browser: Browser, email: string): Promise<Page> {
  const context = await browser.newContext({
    storageState: { cookies: [], origins: [] },
  });
  const page = await context.newPage();
  await page.goto(AUTH_URL);
  await signInByPassword(page, email, "P4ssw0rd");
  await page.waitForURL(`${APP_URL}/**`, { timeout: 30000 });
  return page;
}

const text = `Team feedback rehearsal ${Date.now()}`;

test.describe.serial("team feedback", () => {
  test("group page shows subgroup, team link and members, signed out", async ({
    browser,
  }) => {
    const context = await browser.newContext({
      storageState: { cookies: [], origins: [] },
    });
    const page = await context.newPage();
    await page.goto(`${APP_URL}/acme/marketing`);
    // exact: "Feedback for Marketing" is also a heading on this page
    await expect(
      page.getByRole("heading", { name: "Marketing", exact: true }),
    ).toBeVisible({
      timeout: 15000,
    });
    await expect(
      page.getByTestId("subgroups").getByText("Launch Crew"),
    ).toBeVisible();
    await expect(page.getByText("Feedback for Marketing")).toBeVisible();

    await page.goto(`${APP_URL}/acme/launch-crew`);
    await expect(
      page.getByRole("heading", { name: "Launch Crew", exact: true }),
    ).toBeVisible();
    await expect(page.getByText("← Marketing")).toBeVisible();
    await context.close();
  });

  test("outsider submission is held, addressed to the team, approvable", async ({
    browser,
    page,
  }) => {
    const context = await browser.newContext({
      storageState: { cookies: [], origins: [] },
    });
    const visitor = await context.newPage();
    await visitor.goto(`${APP_URL}/acme/marketing/team`);
    await visitor.getByLabel(FIELD).fill(text);
    await visitor.getByRole("button", { name: /submit feedback/i }).click();
    await visitor.waitForURL(/\/team\/thanks/, { timeout: 20000 });
    await context.close();

    await page.goto(`${APP_URL}/org/acme/admin/moderation`);
    const card = page.getByTestId("pending-feedback").filter({ hasText: text });
    await expect(card).toBeVisible({ timeout: 15000 });
    await expect(card.getByText("To team Marketing")).toBeVisible();
    await card.getByRole("button", { name: "Approve" }).click();
    await expect(card).toHaveCount(0, { timeout: 15000 });
  });

  test("members see it on the group page, no member record carries it, lead is notified", async ({
    browser,
  }) => {
    const jane = await memberPage(browser, "jane.smith@acme.com");
    await jane.goto(`${APP_URL}/acme/marketing`);
    await expect(jane.getByTestId("team-feedback").getByText(text)).toBeVisible(
      { timeout: 15000 },
    );
    await jane.goto(`${APP_URL}/feedback`);
    await expect(jane.getByText(text)).toHaveCount(0);
    await jane.context().close();

    // John leads Marketing: not on his record, but in his outbox as team mail
    const john = await memberPage(browser, "john.doe@acme.com");
    await john.goto(`${APP_URL}/feedback`);
    await expect(john.getByText(text)).toHaveCount(0);
    const res = await john.request.get(
      `${APP_URL}/api/preview-mail?to=${encodeURIComponent("john.doe@acme.com")}`,
    );
    expect(res.ok(), `preview-mail returned ${res.status()}`).toBe(true);
    const emails = (await res.json()) as { html: string }[];
    expect(
      emails.some(e => e.html.includes("team Marketing")),
      "no team feedback notification in the lead's outbox",
    ).toBe(true);
    await john.context().close();
  });

  test("member submission auto-approves onto the team page", async ({
    browser,
  }) => {
    const memberText = `Member team props ${Date.now()}`;
    const jane = await memberPage(browser, "jane.smith@acme.com");
    await jane.goto(`${APP_URL}/acme/marketing/team`);
    await jane.getByLabel(FIELD).fill(memberText);
    await jane.getByRole("button", { name: /submit feedback/i }).click();
    await jane.waitForURL(/\/team\/thanks/, { timeout: 20000 });
    await jane.goto(`${APP_URL}/acme/marketing`);
    await expect(
      jane.getByTestId("team-feedback").getByText(memberText),
    ).toBeVisible({ timeout: 15000 });
    await jane.context().close();
  });
});
