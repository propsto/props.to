/* eslint-disable -- test-only DB setup helper, not part of the shipped app */
import postgres from "postgres";

/**
 * Direct database access for E2E setup that no UI or API can create, such as a
 * pending Google account link (normally minted only by a real Google sign-in).
 * Uses DATABASE_URL, which the E2E run already provides (dotenv locally, the
 * branch database in CI). Raw SQL on purpose: importing @propsto/data pulls
 * Prisma + ESM-only logger into the Playwright runner, which does not load.
 */
const rawUrl = process.env.DATABASE_URL;
if (!rawUrl) throw new Error("DATABASE_URL is required for E2E DB helpers");

// Prisma URLs carry ?schema=public, which postgres.js rejects as a connection
// parameter. Strip it and translate it into a search_path instead.
const parsed = new URL(rawUrl);
const schema = parsed.searchParams.get("schema") ?? "public";
parsed.search = "";

// max: 1 keeps a single short-lived connection; tests close it in afterAll.
export const sql = postgres(parsed.toString(), {
  max: 1,
  connection: { search_path: schema },
});

export async function closeDb(): Promise<void> {
  await sql.end({ timeout: 5 });
}

/**
 * Insert (or replace) a pending Google account link for an existing user,
 * mirroring createPendingAccountLink. Returns the token the magic link carries.
 */
export async function seedPendingGoogleLink(opts: {
  email: string;
  providerAccountId: string;
  hostedDomain?: string | null;
  isGoogleWorkspaceAdmin?: boolean;
  token?: string;
}): Promise<string> {
  const token = opts.token ?? `e2e-pending-${Date.now()}`;
  const data = {
    email: opts.email,
    provider: "google",
    providerAccountId: opts.providerAccountId,
    hostedDomain: opts.hostedDomain ?? null,
    isGoogleWorkspaceAdmin: opts.isGoogleWorkspaceAdmin ?? false,
  };
  const expires = new Date(Date.now() + 15 * 60 * 1000);
  await sql`
    INSERT INTO "PendingAccountLink" (token, email, data, expires)
    VALUES (${token}, ${opts.email}, ${sql.json(data)}, ${expires})
    ON CONFLICT (email) DO UPDATE
      SET token = EXCLUDED.token, data = EXCLUDED.data, expires = EXCLUDED.expires
  `;
  return token;
}

/** True once the Google account is linked to a user (the pending link resolved). */
export async function isGoogleLinked(
  providerAccountId: string,
): Promise<boolean> {
  const rows = await sql`
    SELECT 1 FROM "Account"
    WHERE provider = 'google' AND "providerAccountId" = ${providerAccountId}
    LIMIT 1
  `;
  return rows.length > 0;
}

export async function pendingLinkCount(email: string): Promise<number> {
  const rows = await sql`
    SELECT count(*)::int AS n FROM "PendingAccountLink" WHERE email = ${email}
  `;
  return rows[0]?.n ?? 0;
}

/** Pull the newest outbox email for an address and return the first href matching `pattern`. */
export async function latestOutboxLink(
  to: string,
  pattern: RegExp,
): Promise<string | null> {
  const rows = await sql<{ html: string }[]>`
    SELECT html FROM "EmailOutbox"
    WHERE lower("to") = ${to.toLowerCase()}
    ORDER BY "createdAt" DESC
    LIMIT 1
  `;
  const html = rows[0]?.html;
  if (!html) return null;
  for (const m of html.matchAll(/href="([^"]+)"/g)) {
    const href = m[1].replace(/&amp;/g, "&");
    if (pattern.test(href)) return href;
  }
  return null;
}

/**
 * Seed a password user whose Google Workspace domain already has an org but who
 * is not yet a member, so the onboarding "join organization" step applies. The
 * password hash is copied from an existing seeded user so no bcrypt is needed
 * in the test runner. Reuse `orgHostedDomain` of a seeded org (e.g. acme.com).
 */
export async function seedJoinableUser(opts: {
  id: string;
  email: string;
  slugId: string;
  slug: string;
  firstName: string;
  lastName: string;
  hostedDomain: string;
  copyPasswordFromEmail: string;
}): Promise<void> {
  await resetJoinableUser(opts.id, opts.slug);
  await sql`
    INSERT INTO "Slug" (id, slug, scope, "updatedAt")
    VALUES (${opts.slugId}, ${opts.slug}, 'GLOBAL', now())
  `;
  await sql`
    INSERT INTO "User" (id, email, "slugId", "firstName", "lastName", role, "hostedDomain", password, "emailVerified", "createdAt", "updatedAt")
    VALUES (
      ${opts.id}, ${opts.email}, ${opts.slugId}, ${opts.firstName}, ${opts.lastName},
      'USER', ${opts.hostedDomain},
      (SELECT password FROM "User" WHERE email = ${opts.copyPasswordFromEmail}),
      now(), now(), now()
    )
  `;
}

/** Did the joiner become a member of the org with this hosted domain, and with what role? */
export async function memberRoleOf(
  userId: string,
  hostedDomain: string,
): Promise<string | null> {
  const rows = await sql<{ role: string }[]>`
    SELECT om.role FROM "OrganizationMember" om
    JOIN "Organization" o ON o.id = om."organizationId"
    WHERE om."userId" = ${userId} AND o."hostedDomain" = ${hostedDomain}
    LIMIT 1
  `;
  return rows[0]?.role ?? null;
}

/** Tear down the seeded joiner and anything that references it, FK order first. */
export async function resetJoinableUser(
  userId: string,
  slug: string,
): Promise<void> {
  await sql`DELETE FROM "OrganizationMember" WHERE "userId" = ${userId}`;
  await sql`DELETE FROM "Slug" WHERE "orgSlugOwnerId" = ${userId}`;
  await sql`DELETE FROM "Account" WHERE "userId" = ${userId}`;
  await sql`DELETE FROM "User" WHERE id = ${userId}`;
  await sql`DELETE FROM "Slug" WHERE slug = ${slug} AND scope = 'GLOBAL'`;
}

/** Remove the Google link + pending row so the linking tests can re-run on a dirty DB. */
export async function resetGoogleLink(
  email: string,
  providerAccountId: string,
): Promise<void> {
  await sql`DELETE FROM "Account" WHERE provider = 'google' AND "providerAccountId" = ${providerAccountId}`;
  await sql`DELETE FROM "PendingAccountLink" WHERE email = ${email}`;
  await sql`DELETE FROM "EmailOutbox" WHERE lower("to") = ${email.toLowerCase()}`;
}
