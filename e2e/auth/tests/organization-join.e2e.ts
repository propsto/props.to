import { test, expect } from "@playwright/test";
import { signInByPassword } from "../utils/auth-methods";
import {
  seedJoinableUser,
  memberRoleOf,
  resetJoinableUser,
  closeDb,
  hasDbUrl,
} from "../utils/db";

/**
 * Onboarding "Join organization" step for a Google Workspace member whose org
 * already exists (Acme is seeded with hostedDomain acme.com). The prominent
 * "Join <Org>" button is the step's call to action; it was a plain type="button"
 * that only set a hidden field, so clicking it did nothing and the member was
 * left unable to join. It must submit the step and create the membership.
 *
 * Needs direct DB setup, so it skips when DATABASE_URL is absent (CI runs E2E
 * against a deployed preview with no DB for the runner); runs locally.
 */
const USER_ID = "e2e-joiner-user";
const SLUG_ID = "e2e-joiner-slug";
const SLUG = "e2ejoiner";
const EMAIL = "e2e.joiner@acme.com";

test.describe("onboarding: join organization", () => {
  test.skip(!hasDbUrl, "requires DATABASE_URL for DB setup");

  test.beforeEach(async () => {
    await seedJoinableUser({
      id: USER_ID,
      email: EMAIL,
      slugId: SLUG_ID,
      slug: SLUG,
      firstName: "Joiner",
      lastName: "Test",
      hostedDomain: "acme.com",
      copyPasswordFromEmail: "bob.jones@acme.com",
    });
  });

  test.afterAll(async () => {
    await resetJoinableUser(USER_ID, SLUG);
    await closeDb();
  });

  test('the "Join organization" button adds the member to the org', async ({
    page,
    baseURL,
  }) => {
    await page.goto(baseURL ?? "");
    await signInByPassword(page, EMAIL, "P4ssw0rd");

    // Onboarding is incomplete, so sign-in lands on the stepper. Go to the join step.
    await page.waitForURL(/\/welcome/, { timeout: 30000 });
    await page.goto(`${baseURL}/welcome?step=organization-join`);

    // The step's main CTA — not the "Next" nav button.
    await page.getByRole("button", { name: /Join Acme/ }).click();

    // The click must actually join the org (previously a no-op).
    await expect
      .poll(() => memberRoleOf(USER_ID, "acme.com"), { timeout: 15000 })
      .toBe("MEMBER");
  });
});
