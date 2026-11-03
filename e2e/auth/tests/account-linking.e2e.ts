import { test, expect } from "@playwright/test";
import {
  seedPendingGoogleLink,
  latestOutboxLink,
  isGoogleLinked,
  pendingLinkCount,
  resetGoogleLink,
  closeDb,
} from "../utils/db";

/**
 * The "link your existing account" step, reached when a Google Workspace user
 * signs in but already has an email/password account. A real Google sign-in
 * mints the pending link; here we seed it directly so the test is hermetic.
 *
 * Bob is seeded with a password (bob.jones@acme.com / P4ssw0rd) and is an Acme
 * member, so after linking he continues onboarding rather than finishing.
 * Both tests reset Bob's Google link first so they survive a non-reseeded DB.
 */
const BOB = "bob.jones@acme.com";
const PROVIDER_ID = "e2e-google-bob-link";

test.afterAll(async () => {
  await resetGoogleLink(BOB, PROVIDER_ID);
  await closeDb();
});

test.describe.serial("Google account linking", () => {
  test.beforeEach(async () => {
    await resetGoogleLink(BOB, PROVIDER_ID);
  });

  test("magic link finishes linking and targets the completion route", async ({
    page,
    baseURL,
  }) => {
    const token = await seedPendingGoogleLink({
      email: BOB,
      providerAccountId: PROVIDER_ID,
      hostedDomain: "acme.com",
    });

    await page.goto(`${baseURL}/welcome?step=link-account&token=${token}`);
    await page.getByRole("button", { name: "Send Magic Link" }).click();
    await page.getByRole("button", { name: "Next", exact: true }).click();
    await expect(page.getByText(/check your email/i)).toBeVisible({
      timeout: 15000,
    });

    // Regression: the emailed link must carry a callbackUrl to the completion
    // route. next-auth v5 ignores the v4 `callbackUrl` option, so the link used
    // to fall back to the current page and linking never ran.
    const link = await latestOutboxLink(BOB, /\/api\/auth\/callback\/email/);
    expect(link, "no magic-link email captured in the outbox").toBeTruthy();
    const callbackUrl = new URL(link!).searchParams.get("callbackUrl") ?? "";
    expect(callbackUrl).toContain("/api/link-account/complete");

    // Following the link proves email ownership and finishes the link.
    await page.goto(link!);
    await expect(page.getByText("Choose verification method")).toHaveCount(0);
    expect(await isGoogleLinked(PROVIDER_ID)).toBe(true);
    expect(await pendingLinkCount(BOB)).toBe(0);
  });

  test("password verification links the account and creates a session", async ({
    page,
    baseURL,
  }) => {
    const token = await seedPendingGoogleLink({
      email: BOB,
      providerAccountId: PROVIDER_ID,
      hostedDomain: "acme.com",
    });

    await page.goto(`${baseURL}/welcome?step=link-account&token=${token}`);
    await page.getByRole("button", { name: "Use Password" }).click();
    await page
      .getByPlaceholder("Your existing account password")
      .fill("P4ssw0rd");
    await page.getByRole("button", { name: "Next", exact: true }).click();

    // Regression: verifying the password must also sign Bob in. Without that the
    // next step had no session and bounced to /error?code=InvalidSession.
    await expect(page.getByText("Choose verification method")).toHaveCount(0, {
      timeout: 15000,
    });
    await expect(page).not.toHaveURL(/\/error/);
    expect(await isGoogleLinked(PROVIDER_ID)).toBe(true);
  });
});
