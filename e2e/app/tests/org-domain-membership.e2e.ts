import { test, expect } from "@playwright/test";

/**
 * Domain membership controls for a Workspace org, as the Acme owner (mike).
 * Acme is seeded with hostedDomain "acme.com", so it only invites company
 * addresses, and domain auto-join is an admin opt-in under Settings → Membership.
 */

const PERSONAL_EMAIL = "someone.personal@gmail.com";

test.describe.serial("org domain membership", () => {
  test("a personal address can't be invited to a Workspace org", async ({
    page,
    baseURL,
  }) => {
    await page.goto(`${baseURL}/org/acme/admin/members`);
    await page.getByRole("button", { name: "Invite Members" }).click();
    await page.getByLabel("Email addresses").fill(PERSONAL_EMAIL);
    await page.getByRole("button", { name: "Send Invites" }).click();

    const dialog = page.getByRole("dialog");
    await expect(
      dialog.getByText("1 invitation(s) could not be sent"),
    ).toBeVisible({ timeout: 20000 });
    await expect(
      dialog.getByText(
        `${PERSONAL_EMAIL}: Invite a @acme.com address — personal emails can't be invited`,
      ),
    ).toBeVisible();

    await dialog.getByRole("button", { name: "Cancel" }).click();
    await page.reload();
    await expect(page.getByRole("cell", { name: PERSONAL_EMAIL })).toHaveCount(
      0,
    );
  });

  test("the owner turns domain auto-join on and off", async ({
    page,
    baseURL,
  }) => {
    await page.goto(`${baseURL}/org/acme/admin/settings`);
    const card = page
      .locator('[data-slot="card"]')
      .filter({ hasText: "Auto-join by email domain" });
    const toggle = card.getByRole("switch", {
      name: "Auto-join by email domain",
    });
    const save = card.getByRole("button", { name: "Save Changes" });
    // The server action POSTs to this page; wait for it before reloading
    const saveAndWait = async (): Promise<void> => {
      await Promise.all([
        page.waitForResponse(
          r =>
            r.request().method() === "POST" &&
            r.url().includes("/org/acme/admin/settings"),
        ),
        save.click(),
      ]);
      await expect(save).toBeDisabled({ timeout: 15000 });
    };

    // New and existing orgs start invite-only
    await expect(toggle).not.toBeChecked();
    await expect(save).toBeDisabled();

    await toggle.click();
    await saveAndWait();
    await page.reload();
    await expect(toggle).toBeChecked();

    // Back to invite-only, so other specs see the seeded default
    await toggle.click();
    await saveAndWait();
    await page.reload();
    await expect(toggle).not.toBeChecked();
  });
});
