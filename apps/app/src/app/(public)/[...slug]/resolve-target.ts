import { cache } from "react";
import { headers } from "next/headers";
import {
  resolveSlug as _resolveSlug,
  resolveOrgSlug as _resolveOrgSlug,
  resolveByEmail as _resolveByEmail,
} from "@propsto/data/repos";
import {
  checkRateLimit,
  EMAIL_LOOKUP_RATE_LIMIT,
} from "@propsto/data/utils/rate-limit";

// Cache expensive queries to dedupe between generateMetadata and page render
const resolveSlugBase = cache(_resolveSlug);
const resolveByEmail = cache(_resolveByEmail);
const resolveOrgSlug = cache(_resolveOrgSlug);

// Email detection regex
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Rate-limited slug resolution.
 * Email lookups are rate-limited to prevent enumeration attacks.
 */
const resolveSlug = cache(async function resolveSlugLimited(
  identifier: string,
): ReturnType<typeof resolveSlugBase> {
  // Only apply rate limiting for email lookups
  if (EMAIL_REGEX.test(identifier)) {
    // Get client IP for rate limiting
    const headersList = await headers();
    const forwardedFor = headersList.get("x-forwarded-for");
    const realIp = headersList.get("x-real-ip");
    const clientIp = forwardedFor?.split(",")[0]?.trim() ?? realIp ?? "unknown";

    const rateLimitKey = `email-lookup:${clientIp}`;
    const { allowed } = checkRateLimit(rateLimitKey, EMAIL_LOOKUP_RATE_LIMIT);

    if (!allowed) {
      // Rate limited - return null to show 404 (consistent response)
      return { success: true, data: null };
    }

    return resolveByEmail(identifier);
  }

  return resolveSlugBase(identifier);
});

// Next.js keeps segments percent-encoded (an "@" arrives as "%40"), so decode
// them before matching usernames or emails. Malformed escapes stay as they are.
export function decodeSegments(
  segments: string[] | undefined,
): string[] | undefined {
  return segments?.map(segment => {
    try {
      return decodeURIComponent(segment);
    } catch {
      return segment;
    }
  });
}

// Who a feedback link is addressed to; the target module fetches the link
export type LinkRecipient =
  | { type: "user"; userId: string; organizationId: string | null }
  | { type: "group"; groupId: string; organizationId: string };

/**
 * What a public URL points at. User and org slugs share the root namespace:
 * - /<username> or /<email>: profile ("email" set when it came in by email)
 * - /<orgSlug>: org
 * - /<orgSlug>/<userSlug>: org-member
 * - /<orgSlug>/<groupSlug>: group
 * - /<username>/<linkSlug>: link (personal)
 * - /<orgSlug>/<userSlug|groupSlug>/<linkSlug>: link (org user or group)
 * - /<orgSlug>/<entitySlug>/<linkSlug>: entity
 * - /...path/thanks: thanks page after a submission
 */
export type PublicTarget =
  | { kind: "thanks" }
  | { kind: "profile"; userId: string; slug: string; email?: string }
  | { kind: "org"; organizationId: string }
  | {
      kind: "org-member";
      userId: string;
      organizationId: string;
      orgSlug: string;
      userSlug: string;
    }
  | { kind: "group"; groupId: string; orgSlug: string; groupSlug: string }
  | {
      kind: "entity";
      entityId: string;
      linkSlug: string;
      basePath: string;
    }
  | {
      kind: "link";
      recipient: LinkRecipient;
      // The segment naming the recipient, shown when they have no first name
      recipientSlug: string;
      linkSlug: string;
      basePath: string;
    };

export async function resolveTarget(
  segments: string[] | undefined,
): Promise<PublicTarget | null> {
  if (!segments || segments.length === 0) return null;

  // Check if this is a "thanks" page (last segment is "thanks")
  if (segments[segments.length - 1] === "thanks") return { kind: "thanks" };

  const basePath = `/${segments.join("/")}`;

  if (segments.length === 1) {
    const [identifier] = segments;
    const resolution = (await resolveSlug(identifier)).data;
    if (resolution?.type === "user") {
      return {
        kind: "profile",
        userId: resolution.userId,
        slug: resolution.slug,
        email: resolution.resolvedVia === "email" ? identifier : undefined,
      };
    }
    if (resolution?.type === "organization") {
      return { kind: "org", organizationId: resolution.organizationId };
    }
    return null;
  }

  if (segments.length === 2) {
    // /<username>/<linkSlug> OR /<orgSlug>/<userSlug|groupSlug>
    const [first, second] = segments;
    const resolution = (await resolveSlug(first)).data;
    if (resolution?.type === "user") {
      return {
        kind: "link",
        recipient: {
          type: "user",
          userId: resolution.userId,
          organizationId: null,
        },
        recipientSlug: first,
        linkSlug: second,
        basePath,
      };
    }
    if (resolution?.type !== "organization") return null;
    const orgResolution = (await resolveOrgSlug(first, second)).data;
    if (orgResolution?.type === "user") {
      return {
        kind: "org-member",
        userId: orgResolution.userId,
        organizationId: orgResolution.organizationId,
        orgSlug: first,
        userSlug: second,
      };
    }
    if (orgResolution?.type === "group") {
      return {
        kind: "group",
        groupId: orgResolution.groupId,
        orgSlug: first,
        groupSlug: second,
      };
    }
    return null;
  }

  if (segments.length === 3) {
    // /<orgSlug>/<userSlug|groupSlug|entitySlug>/<linkSlug>
    const [orgSlug, second, linkSlug] = segments;
    const resolution = (await resolveOrgSlug(orgSlug, second)).data;
    if (resolution?.type === "user") {
      return {
        kind: "link",
        recipient: {
          type: "user",
          userId: resolution.userId,
          organizationId: resolution.organizationId,
        },
        recipientSlug: second,
        linkSlug,
        basePath,
      };
    }
    if (resolution?.type === "group") {
      return {
        kind: "link",
        recipient: {
          type: "group",
          groupId: resolution.groupId,
          organizationId: resolution.organizationId,
        },
        recipientSlug: second,
        linkSlug,
        basePath,
      };
    }
    if (resolution?.type === "entity") {
      return {
        kind: "entity",
        entityId: resolution.entityId,
        linkSlug,
        basePath,
      };
    }
    return null;
  }

  return null;
}
