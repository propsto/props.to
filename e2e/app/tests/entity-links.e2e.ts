import { test, expect, type Browser, type Page } from "@playwright/test";
import { signInByPassword } from "../../auth/utils/auth-methods";

/**
 * Entity feedback links. Seed: Acme has the entity "Acme Website" (slug
 * `website`) with the link `feedback`. A signed-out visitor submits
 * anonymously with a ?context=, it waits in moderation, Mike (Acme OWNER, the
 * default storage state) approves it and reads it with its context on the
 * entity's admin page. Nobody receives it as personal feedback: not John (an
 * Acme member), not Mike. (No email assertion: other specs mail John and Mike
 * in parallel; entity feedback has no recipient to notify by construction.)
 */

const AUTH_URL = process.env.AUTH_URL ?? "";
const APP_URL = process.env.PROPSTO_APP_URL ?? "";
const MEMBER = "john.doe@acme.com";

const run = Date.now();
const TEXT = `The pricing diagram is great ${run}`;
const CONTEXT = `Pricing diagram, step 3 ${run}`;
const LINK = `${APP_URL}/acme/website/feedback?context=${encodeURIComponent(CONTEXT)}`;

async function signedIn(browser: Browser, email: string): Promise<Page> {
  const context = await browser.newContext({
    storageState: { cookies: [], origins: [] },
  });
  const page = await context.newPage();
  await page.goto(AUTH_URL);
  await signInByPassword(page, email, "P4ssw0rd");
  await page.waitForURL(`${APP_URL}/**`, { timeout: 30000 });
  return page;
}

function pendingCard(page: Page) {
  return page.getByTestId("pending-feedback").filter({ hasText: TEXT });
}

test.describe.serial("entity links: public, moderated, never personal", () => {
  test("a signed-out visitor submits anonymously with context", async ({
    browser,
  }) => {
    const context = await browser.newContext({
      storageState: { cookies: [], origins: [] },
    });
    const visitor = await context.newPage();
    await visitor.goto(LINK);
    await expect(
      visitor.getByRole("heading", { name: "Give feedback on Acme Website" }),
    ).toBeVisible({ timeout: 15000 });
    await expect(visitor.getByTestId("feedback-context")).toContainText(
      `You're giving feedback on: ${CONTEXT}`,
    );

    await visitor.getByRole("switch").click(); // Submit anonymously
    await visitor
      .getByLabel(/what do you appreciate about this person/i)
      .fill(TEXT);
    await visitor.getByRole("button", { name: /submit feedback/i }).click();
    await visitor.waitForURL(/\/acme\/website\/feedback\/thanks/, {
      timeout: 20000,
    });
    await context.close();
  });

  test("it waits in moderation and the admin approves it", async ({ page }) => {
    await page.goto(`${APP_URL}/org/acme/admin/moderation`);
    const card = pendingCard(page);
    await expect(card).toBeVisible({ timeout: 15000 });
    await expect(card).toContainText("About Acme Website");
    await expect(card).toContainText(CONTEXT);
    await expect(card).toContainText("Anonymous");

    await card.getByRole("button", { name: "Approve" }).click();
    await expect(pendingCard(page)).toHaveCount(0, { timeout: 15000 });
  });

  test("the admin reads it with its context on the entity page", async ({
    page,
  }) => {
    await page.goto(`${APP_URL}/org/acme/admin/entities`);
    await page
      .getByTestId("entity")
      .filter({ hasText: "Acme Website" })
      .getByRole("link", { name: /Feedback/ })
      .click();
    const item = page.getByTestId("entity-feedback").filter({ hasText: TEXT });
    await expect(item).toBeVisible({ timeout: 15000 });
    await expect(item).toContainText(CONTEXT);
  });

  test("it is nobody's received feedback", async ({ page, browser }) => {
    // Mike (owner, approver) does not receive it
    await page.goto(`${APP_URL}/feedback`);
    await expect(
      page.getByRole("heading", { name: "Feedback Received" }),
    ).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(TEXT)).toHaveCount(0);

    // Nor does John, a plain member
    const john = await signedIn(browser, MEMBER);
    await john.goto(`${APP_URL}/feedback`);
    await expect(
      john.getByRole("heading", { name: "Feedback Received" }),
    ).toBeVisible({ timeout: 15000 });
    await expect(john.getByText(TEXT)).toHaveCount(0);
    await john.context().close();
  });
});
