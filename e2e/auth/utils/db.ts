/* eslint-disable -- test-only DB setup helper, not part of the shipped app */
import postgres, { type Sql } from "postgres";

/**
 * Direct database access for E2E setup that no UI or API can create, such as a
 * pending Google account link (normally minted only by a real Google sign-in).
 * Uses DATABASE_URL. The specs that need it skip when it is absent (see
 * hasDbUrl), so importing this file never aborts collection in a CI run that
 * does not provide a database. Raw SQL on purpose: importing @propsto/data
 * pulls Prisma + an ESM-only logger into the Playwright runner, which fails.
 */
export const hasDbUrl = Boolean(process.env.DATABASE_URL);

// Lazily created so a missing DATABASE_URL does not throw at import time, and
// recreated after closeDb so a Playwright worker reused across spec files (one
// file's afterAll ends the client) still gets a live connection.
let client: Sql | null = null;

function conn(): Sql {
  if (client) return client;
  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) throw new Error("DATABASE_URL is required for E2E DB helpers");
  // Prisma URLs carry ?schema=public, which postgres.js rejects as a connection
  // parameter. Drop only that one and translate it to a search_path, keeping
  // the rest of the query (e.g. sslmode=require for a TLS-only branch database).
  const parsed = new URL(rawUrl);
  const schema = parsed.searchParams.get("schema") ?? "public";
  parsed.searchParams.delete("schema");
  client = postgres(parsed.toString(), {
    max: 1,
    connection: { search_path: schema },
  });
  return client;
}

export async function closeDb(): Promise<void> {
  if (client) {
    await client.end({ timeout: 5 });
    client = null;
  }
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
  const sql = conn();
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
  const sql = conn();
  const rows = await sql`
    SELECT 1 FROM "Account"
    WHERE provider = 'google' AND "providerAccountId" = ${providerAccountId}
    LIMIT 1
  `;
  return rows.length > 0;
}

export async function pendingLinkCount(email: string): Promise<number> {
  const sql = conn();
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
  const sql = conn();
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

/** Remove the Google link + pending row so the linking tests can re-run on a dirty DB. */
export async function resetGoogleLink(
  email: string,
  providerAccountId: string,
): Promise<void> {
  const sql = conn();
  await sql`DELETE FROM "Account" WHERE provider = 'google' AND "providerAccountId" = ${providerAccountId}`;
  await sql`DELETE FROM "PendingAccountLink" WHERE email = ${email}`;
  await sql`DELETE FROM "EmailOutbox" WHERE lower("to") = ${email.toLowerCase()}`;
}

/**
 * Seed a password user whose Google Workspace domain already has an org but who
 * is not yet a member, so the onboarding "join organization" step applies. The
 * password hash is copied from an existing seeded user so no bcrypt is needed
 * in the test runner. Reuse `hostedDomain` of a seeded org (e.g. acme.com).
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
  const sql = conn();
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
  const sql = conn();
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
  const sql = conn();
  await sql`DELETE FROM "OrganizationMember" WHERE "userId" = ${userId}`;
  await sql`DELETE FROM "Slug" WHERE "orgSlugOwnerId" = ${userId}`;
  await sql`DELETE FROM "Account" WHERE "userId" = ${userId}`;
  await sql`DELETE FROM "User" WHERE id = ${userId}`;
  await sql`DELETE FROM "Slug" WHERE slug = ${slug} AND scope = 'GLOBAL'`;
}

/**
 * Set the org's domain auto-join flag (off by default; joining by domain is
 * opt-in) and return its previous value, or null when the org had no settings
 * row, so a spec can put it back with restoreAutoJoinByDomain.
 */
export async function setAutoJoinByDomain(
  hostedDomain: string,
  enabled: boolean,
): Promise<boolean | null> {
  const sql = conn();
  const rows = await sql<{ orgId: string; prev: boolean | null }[]>`
    SELECT o.id AS "orgId", s."autoJoinByDomain" AS prev
    FROM "Organization" o
    LEFT JOIN "OrganizationSettings" s ON s."organizationId" = o.id
    WHERE o."hostedDomain" = ${hostedDomain}
    LIMIT 1
  `;
  const row = rows[0];
  if (!row)
    throw new Error(`No organization with hostedDomain ${hostedDomain}`);
  await sql`
    INSERT INTO "OrganizationSettings" (id, "organizationId", "autoJoinByDomain", "updatedAt")
    VALUES (${`e2e-settings-${row.orgId}`}, ${row.orgId}, ${enabled}, now())
    ON CONFLICT ("organizationId") DO UPDATE
      SET "autoJoinByDomain" = EXCLUDED."autoJoinByDomain", "updatedAt" = now()
  `;
  return row.prev;
}

/** Undo setAutoJoinByDomain: restore the previous flag, or drop the row it created. */
export async function restoreAutoJoinByDomain(
  hostedDomain: string,
  previous: boolean | null,
): Promise<void> {
  const sql = conn();
  if (previous === null) {
    await sql`
      DELETE FROM "OrganizationSettings"
      WHERE id LIKE 'e2e-settings-%' AND "organizationId" =
        (SELECT id FROM "Organization" WHERE "hostedDomain" = ${hostedDomain} LIMIT 1)
    `;
    return;
  }
  await sql`
    UPDATE "OrganizationSettings" SET "autoJoinByDomain" = ${previous}, "updatedAt" = now()
    WHERE "organizationId" =
      (SELECT id FROM "Organization" WHERE "hostedDomain" = ${hostedDomain} LIMIT 1)
  `;
}
