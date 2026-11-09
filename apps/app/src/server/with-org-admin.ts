import { createAuditLog, verifyOrgAdminAccess } from "@propsto/data/repos";
import type { CreateAuditLogInput } from "@propsto/data/repos";
import { auth } from "@/server/auth.server";

/**
 * The one result shape of an org admin server action.
 */
export type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

export const NOT_SIGNED_IN = "You are not signed in";
export const NOT_ORG_ADMIN = "You are not an admin of this organization";

export type OrgAdminContext = {
  userId: string;
  userName: string | undefined;
  org: { id: string; name: string };
  role: "OWNER" | "ADMIN";
  /** Write an audit row for this org with the signed-in admin as the actor */
  audit: (
    action: CreateAuditLogInput["action"],
    resource: { type: string; id?: string },
    details?: CreateAuditLogInput["details"],
  ) => Promise<void>;
};

/**
 * Action-level admin guard: fetches the session and checks the OWNER/ADMIN
 * membership once, then runs `fn`. Pages use `requireOrgAdmin` instead, which
 * redirects rather than returning an error.
 */
export async function withOrgAdmin<T>(
  orgSlug: string,
  fn: (ctx: OrgAdminContext) => Promise<ActionResult<T>>,
): Promise<ActionResult<T>> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { success: false, error: NOT_SIGNED_IN };

  const membership = await verifyOrgAdminAccess(userId, orgSlug);
  if (!membership.success || !membership.data) {
    return { success: false, error: NOT_ORG_ADMIN };
  }
  const { organization, role } = membership.data;
  const org = { id: organization.id, name: organization.name };

  return fn({
    userId,
    userName: `${session?.user?.name ?? ""}`.trim() || undefined,
    org,
    role: role as "OWNER" | "ADMIN",
    audit: async (action, resource, details) => {
      await createAuditLog({
        organizationId: org.id,
        actorId: userId,
        action,
        resourceType: resource.type,
        resourceId: resource.id,
        details,
      });
    },
  });
}

/** Success with no payload */
export function ok(): ActionResult;
export function ok<T>(data: T): ActionResult<T>;
export function ok<T>(data?: T): ActionResult<T | undefined> {
  return { success: true, data };
}

/** Failure with the repo's error, or `fallback` when it has none */
export function fail(
  error: string | undefined,
  fallback = "Something went wrong",
): { success: false; error: string } {
  return { success: false, error: error || fallback };
}
