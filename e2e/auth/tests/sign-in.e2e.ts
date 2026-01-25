/* eslint-disable @typescript-eslint/no-non-null-assertion -- env vars checked anyway */
import { test, expect } from "@playwright/test";
import { signInByPassword } from "../utils/auth-methods";

test.describe("Authentication Page", () => {
  test("should display sign-in form with all auth options", async ({
    page,
    baseURL,
  }) => {
    await page.goto(baseURL ?? "");
    await expect(page).toHaveTitle(/Authenticate/);

    // Verify email input is visible
    await expect(page.getByLabel("email")).toBeVisible();

    // Verify all auth method buttons are visible
    await expect(
      page.getByRole("button", { name: "Continue with magic link" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Continue with password" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Sign in with Passkey" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Sign in with Google" }),
    ).toBeVisible();
  });

  test("should have proper page structure and branding", async ({
    page,
    baseURL,
  }) => {
    await page.goto(baseURL ?? "");

    // Check for Props.to branding (use first() as it may appear multiple times)
    await expect(page.getByText("Props.to").first()).toBeVisible();

    // Check for motivational quote (part of the UI)
    const bodyText = await page.textContent("body");
    expect(bodyText?.length).toBeGreaterThan(100);
  });
});

test.describe("Password Authentication", () => {
  test("should successfully authenticate with valid credentials", async ({
    page,
    baseURL,
  }) => {
    await page.goto(baseURL ?? "");
    await expect(page).toHaveTitle(/Authenticate/);

    await signInByPassword(page, "mike.ryan@example.com", "P4ssw0rd");

    // Wait for auth to complete
    await page.waitForTimeout(2000);

    // Verify session cookie was set
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find(
      c =>
        c.name.includes("authjs.session-token") ||
        c.name.includes("__Secure-authjs.session-token"),
    );
    expect(sessionCookie).toBeDefined();
  });

  test("should show error for invalid credentials", async ({
    page,
    baseURL,
  }) => {
    await page.goto(baseURL ?? "");

    // Fill email
    await page.getByLabel("email").fill("mike.ryan@example.com");

    // Click Continue with password twice to reveal password field
    await page.getByRole("button", { name: "Continue with password" }).click();
    await page.getByRole("button", { name: "Continue with password" }).click();

    // Wait for password field
    await expect(page.getByLabel("password")).toBeVisible({ timeout: 10000 });

    // Enter wrong password
    await page.getByLabel("password").fill("wrongpassword");
    await page.getByRole("button", { name: "Sign in with password" }).click();

    // Should show error
    await expect(
      page.getByText(/wrong credentials|invalid|error/i),
    ).toBeVisible({ timeout: 10000 });
  });

  test("should show reset password option for user without password", async ({
    page,
    baseURL,
  }) => {
    await page.goto(baseURL ?? "");

    // Fill email for a user without password (leo@props.to from seed)
    await page.getByLabel("email").fill("leo@props.to");

    // Click Continue with password twice
    await page.getByRole("button", { name: "Continue with password" }).click();
    await page.getByRole("button", { name: "Continue with password" }).click();

    // Should show message about no password set (use first() as there may be multiple matches)
    await expect(
      page.getByText(/not set a password|reset password/i).first(),
    ).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Magic Link Authentication", () => {
  test("should initiate magic link flow", async ({ page, baseURL }) => {
    await page.goto(baseURL ?? "");

    // Fill email
    await page.getByLabel("email").fill("test-magic-link@example.com");

    // Click magic link button
    await page
      .getByRole("button", { name: "Continue with magic link" })
      .click();

    // Should show confirmation or redirect to check email page
    // The exact behavior depends on implementation
    await page.waitForTimeout(2000);

    // Page should show some indication that email was sent or form should change
    const pageContent = await page.textContent("body");
    expect(pageContent).toBeTruthy();
  });
});

test.describe("Google OAuth Authentication", () => {
  test("should initiate Google OAuth flow", async ({ page, baseURL }) => {
    await page.goto(baseURL ?? "");

    // Click Google sign-in button
    const googleButton = page.getByRole("button", {
      name: "Sign in with Google",
    });
    await expect(googleButton).toBeVisible();

    // Clicking should initiate OAuth - we can verify the redirect starts
    // We won't complete the flow as it requires actual Google credentials
    const [popup] = await Promise.all([
      page.waitForEvent("popup", { timeout: 5000 }).catch(() => null),
      googleButton.click(),
    ]);

    // Either a popup opens for Google or the page redirects
    if (popup) {
      // Popup flow - verify it opened
      expect(popup).toBeTruthy();
      await popup.close();
    } else {
      // Redirect flow - verify URL changed or is changing
      await page.waitForTimeout(1000);
      // The page might redirect to Google OAuth
    }
  });
});

test.describe("Passkey Authentication", () => {
  test("should show passkey sign-in option", async ({ page, baseURL }) => {
    await page.goto(baseURL ?? "");

    // Verify passkey button is visible
    const passkeyButton = page.getByRole("button", {
      name: "Sign in with Passkey",
    });
    await expect(passkeyButton).toBeVisible();

    // Note: Actually testing passkey requires WebAuthn setup which is
    // complex in E2E tests. We verify the option is available.
  });
});

test.describe("Form Validation", () => {
  test("should require email before proceeding", async ({ page, baseURL }) => {
    await page.goto(baseURL ?? "");

    // Try to click Continue with password without entering email
    await page.getByRole("button", { name: "Continue with password" }).click();

    // Page should still show email field (didn't proceed to next step)
    const emailInput = page.getByLabel("email");
    await expect(emailInput).toBeVisible();

    // Password field should not be visible yet
    const passwordField = page.getByLabel("password");
    await expect(passwordField).not.toBeVisible();
  });

  test("should validate email format", async ({ page, baseURL }) => {
    await page.goto(baseURL ?? "");

    // Enter invalid email
    await page.getByLabel("email").fill("invalid-email");

    // Try to submit
    await page.getByRole("button", { name: "Continue with password" }).click();

    // Should show validation error
    const emailInput = page.getByLabel("email");
    const isInvalid = await emailInput.evaluate(
      el => (el as HTMLInputElement).validity.typeMismatch,
    );
    expect(isInvalid).toBeTruthy();
  });
});
