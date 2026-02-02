/**
 * Migration Script: Link existing users to their Google Workspace organizations
 *
 * This script identifies users by email domain and links them to organizations
 * that have the same hostedDomain configured.
 *
 * Usage:
 *   pnpm --filter @propsto/data migrate:users-to-orgs          # Dry run
 *   pnpm --filter @propsto/data migrate:users-to-orgs --apply  # Apply changes
 */

import { db } from "../db";
import { createLogger } from "@propsto/logger";
import { generateUniqueSlug } from "../repos/slug";

const logger = createLogger("migration");

interface MigrationResult {
  userId: string;
  userEmail: string;
  organizationId: string;
  organizationName: string;
  action: "linked" | "already_member" | "error";
  error?: string;
  orgSlug?: string;
}

async function migrateUsersToOrgs(dryRun: boolean): Promise<void> {
  console.log(`\n🔄 Migration: Link users to Google Workspace organizations`);
  console.log(`   Mode: ${dryRun ? "DRY RUN (no changes)" : "APPLY CHANGES"}\n`);

  // 1. Get all organizations with a hostedDomain
  const orgs = await db.organization.findMany({
    where: {
      hostedDomain: { not: null },
    },
    include: {
      members: {
        select: { userId: true },
      },
      slug: true,
    },
  });

  if (orgs.length === 0) {
    console.log("ℹ️  No organizations with hostedDomain found. Nothing to migrate.");
    return;
  }

  console.log(`📋 Found ${orgs.length} organization(s) with Google Workspace domains:\n`);
  for (const org of orgs) {
    console.log(`   - ${org.name} (${org.hostedDomain})`);
  }
  console.log("");

  const results: MigrationResult[] = [];

  // 2. For each org, find users with matching email domain
  for (const org of orgs) {
    const domain = org.hostedDomain!;
    const existingMemberIds = new Set(org.members.map((m) => m.userId));

    // Find users whose email ends with @domain (case-insensitive)
    const usersWithDomain = await db.user.findMany({
      where: {
        email: { endsWith: `@${domain}`, mode: "insensitive" },
      },
      include: {
        slug: true,
      },
    });

    console.log(`\n🏢 ${org.name} (@${domain})`);
    console.log(`   Existing members: ${existingMemberIds.size}`);
    console.log(`   Users with matching domain: ${usersWithDomain.length}`);

    for (const user of usersWithDomain) {
      // Check if already a member
      if (existingMemberIds.has(user.id)) {
        results.push({
          userId: user.id,
          userEmail: user.email,
          organizationId: org.id,
          organizationName: org.name,
          action: "already_member",
        });
        console.log(`   ⏭️  ${user.email} — already a member`);
        continue;
      }

      // Generate org-scoped slug for the user
      const baseSlug = user.slug?.slug || user.email.split("@")[0];
      const slugResult = await generateUniqueSlug(baseSlug, "ORGANIZATION", org.id);

      if (!slugResult.success || !slugResult.data) {
        results.push({
          userId: user.id,
          userEmail: user.email,
          organizationId: org.id,
          organizationName: org.name,
          action: "error",
          error: "Failed to generate org-scoped slug",
        });
        console.log(`   ❌ ${user.email} — failed to generate slug`);
        continue;
      }

      const orgSlug = slugResult.data;

      if (dryRun) {
        results.push({
          userId: user.id,
          userEmail: user.email,
          organizationId: org.id,
          organizationName: org.name,
          action: "linked",
          orgSlug,
        });
        console.log(`   🔗 ${user.email} — would be linked (slug: @${orgSlug})`);
      } else {
        try {
          // Create the membership and org-scoped slug in a transaction
          await db.$transaction(async (tx) => {
            // Create org-scoped slug
            await tx.slug.create({
              data: {
                slug: orgSlug,
                scope: "ORGANIZATION",
                scopedToOrgId: org.id,
                orgSlugOwnerId: user.id,
              },
            });

            // Create membership
            await tx.organizationMember.create({
              data: {
                userId: user.id,
                organizationId: org.id,
                role: "MEMBER",
              },
            });

            // Update user's hostedDomain if not set
            if (!user.hostedDomain) {
              await tx.user.update({
                where: { id: user.id },
                data: { hostedDomain: domain },
              });
            }

            logger("Migrated user to org", {
              userId: user.id,
              userEmail: user.email,
              organizationId: org.id,
              orgSlug,
            });

            // Log audit event
            await tx.auditLog.create({
              data: {
                organizationId: org.id,
                action: "MEMBER_MIGRATION",
                entityType: "MEMBER",
                entityId: user.id,
                changes: {
                  action: "auto_linked_by_domain",
                  userEmail: user.email,
                  orgSlug,
                  migratedAt: new Date().toISOString(),
                },
              },
            });
          });

          results.push({
            userId: user.id,
            userEmail: user.email,
            organizationId: org.id,
            organizationName: org.name,
            action: "linked",
            orgSlug,
          });
          console.log(`   ✅ ${user.email} — linked (slug: @${orgSlug})`);
        } catch (error) {
          results.push({
            userId: user.id,
            userEmail: user.email,
            organizationId: org.id,
            organizationName: org.name,
            action: "error",
            error: error instanceof Error ? error.message : "Unknown error",
          });
          console.log(`   ❌ ${user.email} — error: ${error}`);
        }
      }
    }
  }

  // 3. Summary
  const linked = results.filter((r) => r.action === "linked").length;
  const alreadyMembers = results.filter((r) => r.action === "already_member").length;
  const errors = results.filter((r) => r.action === "error").length;

  console.log(`\n${"─".repeat(50)}`);
  console.log(`📊 Migration Summary${dryRun ? " (DRY RUN)" : ""}`);
  console.log(`${"─".repeat(50)}`);
  console.log(`   ✅ Linked: ${linked}`);
  console.log(`   ⏭️  Already members: ${alreadyMembers}`);
  console.log(`   ❌ Errors: ${errors}`);
  console.log(`${"─".repeat(50)}\n`);

  if (dryRun && linked > 0) {
    console.log(`ℹ️  Run with --apply to apply these changes.\n`);
  }
}

// Main
const args = process.argv.slice(2);
const dryRun = !args.includes("--apply");

migrateUsersToOrgs(dryRun)
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });
