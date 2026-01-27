import { createLogger } from "@propsto/logger";
import { isReservedSlug as checkReservedSlug } from "@propsto/constants/other";
import { db } from "../db";
import { handleError } from "../utils/error-handling";
import { handleSuccess } from "../utils/success-handling";
import { SlugScope } from "@prisma/client";

const logger = createLogger("data");

// Types for slug resolution
export type SlugResolution =
  | { type: "user"; userId: string; slug: string }
  | { type: "organization"; organizationId: string; slug: string }
  | null;

export type OrgSlugResolution =
  | {
      type: "user";
      userId: string;
      orgSlug: string;
      userSlug: string;
      organizationId: string;
    }
  | {
      type: "group";
      groupId: string;
      orgSlug: string;
      groupSlug: string;
      organizationId: string;
    }
  | null;

// Resolve a global slug (props.to/[slug])
// Can be a user's personal username or an organization slug
export async function resolveSlug(
  slug: string,
): Promise<HandleEvent<SlugResolution>> {
  try {
    logger("resolveSlug", { slug });

    const slugRecord = await db.slug.findFirst({
      where: {
        slug: slug.toLowerCase(),
        scope: "GLOBAL",
        scopedToOrgId: null,
      },
      include: {
        personalSlugOwner: { select: { id: true } },
        organization: { select: { id: true } },
      },
    });

    if (!slugRecord) {
      return handleSuccess(null);
    }

    // Check if it's a user's personal slug
    if (slugRecord.personalSlugOwner) {
      return handleSuccess({
        type: "user" as const,
        userId: slugRecord.personalSlugOwner.id,
        slug: slugRecord.slug,
      });
    }

    // Check if it's an organization slug
    if (slugRecord.organization) {
      return handleSuccess({
        type: "organization" as const,
        organizationId: slugRecord.organization.id,
        slug: slugRecord.slug,
      });
    }

    return handleSuccess(null);
  } catch (e) {
    return handleError(e);
  }
}

// Resolve an organization-scoped slug (props.to/[orgSlug]/[userOrGroupSlug])
// Can be a user's org-scoped username or a group within the org
export async function resolveOrgSlug(
  orgSlug: string,
  userOrGroupSlug: string,
): Promise<HandleEvent<OrgSlugResolution>> {
  try {
    logger("resolveOrgSlug", { orgSlug, userOrGroupSlug });

    // First, resolve the organization
    const orgSlugRecord = await db.slug.findFirst({
      where: {
        slug: orgSlug.toLowerCase(),
        scope: "GLOBAL",
        scopedToOrgId: null,
      },
      include: {
        organization: { select: { id: true } },
      },
    });

    if (!orgSlugRecord?.organization) {
      return handleSuccess(null);
    }

    const organizationId = orgSlugRecord.organization.id;

    // Now resolve the user/group slug within the org
    const scopedSlugRecord = await db.slug.findFirst({
      where: {
        slug: userOrGroupSlug.toLowerCase(),
        scope: "ORGANIZATION",
        scopedToOrgId: organizationId,
      },
      include: {
        orgSlugOwner: { select: { id: true } },
        group: { select: { id: true } },
      },
    });

    if (!scopedSlugRecord) {
      return handleSuccess(null);
    }

    // Check if it's a user's org-scoped slug
    if (scopedSlugRecord.orgSlugOwner) {
      return handleSuccess({
        type: "user" as const,
        userId: scopedSlugRecord.orgSlugOwner.id,
        orgSlug: orgSlug.toLowerCase(),
        userSlug: userOrGroupSlug.toLowerCase(),
        organizationId,
      });
    }

    // Check if it's a group slug
    if (scopedSlugRecord.group && scopedSlugRecord.group.length > 0) {
      return handleSuccess({
        type: "group" as const,
        groupId: scopedSlugRecord.group[0].id,
        orgSlug: orgSlug.toLowerCase(),
        groupSlug: userOrGroupSlug.toLowerCase(),
        organizationId,
      });
    }

    return handleSuccess(null);
  } catch (e) {
    return handleError(e);
  }
}

// Check if a slug is available
export async function isSlugAvailable(
  slug: string,
  scope: SlugScope,
  organizationId?: string,
): Promise<HandleEvent<boolean>> {
  try {
    logger("isSlugAvailable", { slug, scope, organizationId });

    // Check reserved slugs for GLOBAL scope (usernames and org names)
    if (scope === "GLOBAL" && checkReservedSlug(slug)) {
      return handleSuccess(false);
    }

    const existingSlug = await db.slug.findFirst({
      where: {
        slug: slug.toLowerCase(),
        scope,
        scopedToOrgId: scope === "ORGANIZATION" ? organizationId : null,
      },
    });

    return handleSuccess(!existingSlug);
  } catch (e) {
    return handleError(e);
  }
}

// Generate a unique slug based on a base string
export async function generateUniqueSlug(
  base: string,
  scope: SlugScope,
  organizationId?: string,
): Promise<HandleEvent<string>> {
  try {
    logger("generateUniqueSlug", { base, scope, organizationId });

    // Sanitize base: lowercase, replace spaces with dashes, remove special chars
    let slugBase = base
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .slice(0, 20);

    // If base is empty after sanitization, use a default
    if (!slugBase) {
      slugBase = "user";
    }

    // Check reserved slugs for GLOBAL scope
    const isBaseReserved = scope === "GLOBAL" && checkReservedSlug(slugBase);

    // Check if base slug is available in database
    const baseExists = await db.slug.findFirst({
      where: {
        slug: slugBase,
        scope,
        scopedToOrgId: scope === "ORGANIZATION" ? organizationId : null,
      },
    });

    if (!baseExists && !isBaseReserved) {
      return handleSuccess(slugBase);
    }

    // Try adding numbers until we find an available slug
    let counter = 1;
    let candidateSlug = `${slugBase}${counter}`;

    while (counter < 1000) {
      const isCandidateReserved =
        scope === "GLOBAL" && checkReservedSlug(candidateSlug);
      const exists = await db.slug.findFirst({
        where: {
          slug: candidateSlug,
          scope,
          scopedToOrgId: scope === "ORGANIZATION" ? organizationId : null,
        },
      });

      if (!exists && !isCandidateReserved) {
        return handleSuccess(candidateSlug);
      }

      counter++;
      candidateSlug = `${slugBase}${counter}`;
    }

    // Fallback: use base with random string
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    return handleSuccess(`${slugBase}-${randomSuffix}`);
  } catch (e) {
    return handleError(e);
  }
}

// Validate slug format
export function isValidSlugFormat(slug: string): boolean {
  // Must be 3-30 characters, lowercase alphanumeric and dashes, can't start/end with dash
  const slugRegex = /^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/;
  return slugRegex.test(slug) && !slug.includes("--");
}

// Get all slugs for a user (personal + org-scoped)
export async function getUserSlugs(userId: string): Promise<
  HandleEvent<{
    personal: { slug: string } | null;
    organizational: {
      slug: string;
      organizationId: string;
      organizationName: string;
    }[];
  }>
> {
  try {
    logger("getUserSlugs", { userId });

    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        slug: true,
        organizationSlugs: {
          include: {
            scopedToOrg: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!user) {
      return handleSuccess({ personal: null, organizational: [] });
    }

    return handleSuccess({
      personal: user.slug ? { slug: user.slug.slug } : null,
      organizational: user.organizationSlugs
        .filter(s => s.scopedToOrg)
        .map(s => ({
          slug: s.slug,
          organizationId: s.scopedToOrg!.id,
          organizationName: s.scopedToOrg!.name,
        })),
    });
  } catch (e) {
    return handleError(e);
  }
}

// Re-export the centralized isReservedSlug function
export { isReservedSlug } from "@propsto/constants/other";
