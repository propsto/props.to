import { test, expect, type Browser, type Page } from "@playwright/test";

// Release test for gate 4 takedown: a leaked link is paused from the UI and its
// public URL then refuses feedback; resume restores it; delete makes it 404.

const ANSWER_LABEL = /what do you appreciate about this person/i;

async function createLink(page: Page, name: string): Promise<string> {
  await page.goto("/links/new");
  await expect(
    page.getByRole("heading", { name: /create feedback link/i }),
  ).toBeVisible({ timeout: 15000 });
  await page.getByLabel(/link name/i).fill(name);
  await page.getByLabel(/url slug/i).fill(`takedown-${Date.now()}`);
  await expect(page.locator(".text-green-500")).toBeVisible({ timeout: 5000 });
  const templateSection = page.locator("text=Template").locator("..");
  await templateSection.getByRole("combobox").click();
  await page
    .getByRole("option", { name: /quick props/i })
    .first()
    .click();
  await page.getByRole("button", { name: /create link/i }).click();
  await page.waitForURL(/\/links\/?(?:\?|$)/, { timeout: 20000 });

  const path = await linkCard(page, name).locator("code").textContent();
  expect(path).toBeTruthy();
  return path!.trim();
}

function linkCard(page: Page, name: string) {
  return page.locator('[data-slot="card"]').filter({ hasText: name });
}

async function linkMenu(page: Page, name: string, item: RegExp): Promise<void> {
  const card = linkCard(page, name);
  await card.hover();
  await card.getByRole("button", { name: "Actions" }).click();
  await page.getByRole("menuitem", { name: item }).click();
}

async function anonymousPage(browser: Browser): Promise<Page> {
  const context = await browser.newContext({
    storageState: { cookies: [], origins: [] },
  });
  return context.newPage();
}

test.describe("Link takedown", () => {
  test("pause refuses feedback, resume restores it, delete 404s", async ({
    page,
    browser,
    baseURL,
  }) => {
    const name = `Takedown Link ${Date.now()}`;
    const publicPath = await createLink(page, name);
    const publicUrl = `${baseURL}${publicPath}`;

    // A visitor has the form open before the owner pauses the link
    const visitor = await anonymousPage(browser);
    await visitor.goto(publicUrl);
    await expect(visitor.getByLabel(ANSWER_LABEL)).toBeVisible({
      timeout: 15000,
    });

    await linkMenu(page, name, /^pause$/i);
    await expect(
      linkCard(page, name).getByText("Paused", { exact: true }),
    ).toBeVisible({ timeout: 15000 });

    // The already-open form is refused server-side
    await visitor.getByLabel(ANSWER_LABEL).fill("Submitted after takedown");
    await visitor.getByRole("button", { name: /submit feedback/i }).click();
    await expect(visitor.getByText(/no longer active/i)).toBeVisible({
      timeout: 15000,
    });

    // A fresh visit gets the not-found page
    await visitor.goto(publicUrl);
    await expect(visitor.getByText("Page not found")).toBeVisible();
    await expect(visitor.getByLabel(ANSWER_LABEL)).toHaveCount(0);

    // Resume brings the form back
    await linkMenu(page, name, /^activate$/i);
    await expect(
      linkCard(page, name).getByText("Active", { exact: true }),
    ).toBeVisible({ timeout: 15000 });
    await visitor.goto(publicUrl);
    await expect(visitor.getByLabel(ANSWER_LABEL)).toBeVisible({
      timeout: 15000,
    });

    // Delete removes it from the list and the public URL 404s
    page.once("dialog", dialog => void dialog.accept());
    await linkMenu(page, name, /^delete$/i);
    await expect(linkCard(page, name)).toHaveCount(0, { timeout: 15000 });
    await visitor.goto(publicUrl);
    await expect(visitor.getByText("Page not found")).toBeVisible();

    await visitor.context().close();
  });
});

test.describe("Paging", () => {
  // Seed gives Mike 24 received feedbacks and acme 25 audit entries (page size 20)
  test("received feedback pages forward and back", async ({ page }) => {
    await page.goto("/feedback");
    await expect(page.getByText(/^Page 1 of \d+$/)).toBeVisible({
      timeout: 15000,
    });
    await page.getByRole("link", { name: /next/i }).click();
    await expect(page).toHaveURL(/\/feedback\?page=2$/);
    await expect(page.getByText(/^Page 2 of \d+$/)).toBeVisible();
    await page.getByRole("link", { name: /previous/i }).click();
    await expect(page.getByText(/^Page 1 of \d+$/)).toBeVisible();
  });

  test("audit log pages forward and back", async ({ page }) => {
    await page.goto("/org/acme/admin/audit");
    await expect(page.getByText(/^Page 1 of \d+$/)).toBeVisible({
      timeout: 15000,
    });
    await page.getByRole("link", { name: /next/i }).click();
    await expect(page).toHaveURL(/\/admin\/audit\?page=2$/);
    await expect(page.getByText(/^Page 2 of \d+$/)).toBeVisible();
    await page.getByRole("link", { name: /previous/i }).click();
    await expect(page.getByText(/^Page 1 of \d+$/)).toBeVisible();
  });
});
