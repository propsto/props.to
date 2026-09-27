import { test, expect, type Page } from "@playwright/test";
import { signInByPassword } from "../../auth/utils/auth-methods";

/**
 * Invite lifecycle end to end (pilot readiness gate 1), using the preview outbox
 * (EMAIL_PROVIDER=outbox) to read the invite email back through /api/preview-mail.
 *
 * Runs as mike (Acme OWNER) and invites carol (Globex owner, not an Acme member).
 * Note: accepting makes carol an Acme member, so this file is not idempotent on a
 * database that is not reseeded (previews reseed on every build).
 */

const AUTH_URL = process.env.AUTH_URL ?? "";
const APP_URL = process.env.PROPSTO_APP_URL ?? "";
const INVITEE = "carol.white@globex.com";

async function latestInviteLink(page: Page): Promise<string> {
  const res = await page.request.get(
    `${APP_URL}/api/preview-mail?to=${encodeURIComponent(INVITEE)}`,
  );
  expect(res.ok(), `preview-mail returned ${res.status()}`).toBe(true);
  const emails = (await res.json()) as {
    subject: string;
    html: string;
    createdAt: string;
  }[];
  const invite = emails.find(e => /invited/i.test(e.subject));
  expect(invite, "no invite email in the outbox").toBeTruthy();
  const match = invite!.html.match(/invite\?token=([A-Za-z0-9_-]+)/);
  expect(match, "invite email has no token link").toBeTruthy();
  return `${AUTH_URL}/invite?token=${match![1]}`;
}

test.describe
  .serial("invite: email captured, wrong account refused, right account joins once", () => {
  let inviteUrl = "";

  test("owner invites a non-member and the email lands in the outbox", async ({
    page,
    baseURL,
  }) => {
    await page.goto(`${baseURL}/org/acme/admin/members`);
    await page.getByRole("button", { name: "Invite Members" }).click();
    await page.getByLabel("Email addresses").fill(INVITEE);
    await page.getByRole("button", { name: "Send Invites" }).click();
    await expect(page.getByRole("dialog")).toBeHidden({ timeout: 20000 });
    await page.reload();
    await expect(page.getByRole("cell", { name: INVITEE })).toBeVisible({
      timeout: 20000,
    });

    inviteUrl = await latestInviteLink(page);
  });

  test("the inviter (wrong account) cannot accept, and GET does not consume the token", async ({
    page,
  }) => {
    await page.goto(inviteUrl);
    await expect(page.getByText("Wrong Account")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Accept invitation" }),
    ).toHaveCount(0);
  });

  test.describe("as the invitee", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test("the invitee accepts once; a second use is refused", async ({
      page,
    }) => {
      await page.goto(AUTH_URL);
      await signInByPassword(page, INVITEE, "P4ssw0rd");
      await page.waitForURL(`${APP_URL}/**`, { timeout: 30000 });

      await page.goto(inviteUrl);
      await expect(
        page.getByRole("heading", { name: /Join Acme/ }),
      ).toBeVisible();
      await page.getByRole("button", { name: "Accept invitation" }).click();
      await page.waitForURL(`${APP_URL}/**`, { timeout: 30000 });

      // now a member: the acme admin area is still closed to a MEMBER, but the org is joined
      await page.goto(inviteUrl);
      await expect(page.getByText("Invitation No Longer Valid")).toBeVisible();
    });
  });
});
