"use server";

import { auth } from "@/server/auth.server";
import {
  verifyOrgAdminAccess,
  getOrganizationBySlug,
  createOrganizationInvite,
  getOrganizationInviteByEmail,
  listPendingOrganizationInvites,
  revokeOrganizationInvite,
  resendOrganizationInvite,
  getUserByEmail,
  getUserOrganizationMembership,
  updateOrganizationMemberRole,
  removeOrganizationMember,
  setOrganizationMemberLevel,
  auditHelpers,
} from "@propsto/data/repos";
import { sendOrgInviteEmail } from "@propsto/email/send/org-invite";
import { revalidatePath } from "next/cache";
import { constServer } from "@propsto/constants/server";
import type { OrganizationRole } from "@prisma/client";

const INVITE_EXPIRY_HOURS = 24;

async function verifyAdminAccess(orgSlug: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Not authenticated", userId: null, orgId: null };
  }

  const membershipResult = await verifyOrgAdminAccess(session.user.id, orgSlug);
  if (!membershipResult.success || !membershipResult.data) {
    return { error: "Not authorized", userId: null, orgId: null };
  }

  return {
    error: null,
    userId: session.user.id,
    orgId: membershipResult.data.organization.id,
    role: membershipResult.data.role,
    userName: `${session.user.name ?? ""}`.trim() || undefined,
  };
}

/**
 * Invite one or more members to the organization by email
 */
export async function inviteMembersAction(
  orgSlug: string,
  data: {
    emails: string[];
    role: OrganizationRole;
    message?: string;
  },
) {
  const { error, userId, orgId, userName } = await verifyAdminAccess(orgSlug);
  if (error || !userId || !orgId) {
    return { success: false, error: error ?? "Organization not found" };
  }

  // Server-side role check: an ADMIN must not be able to mint an OWNER invite
  if (data.role !== "MEMBER" && data.role !== "ADMIN") {
    return { success: false, error: "Invalid role" };
  }

  // Check allowUserInvites setting
  const orgResult = await getOrganizationBySlug(orgSlug);
  if (!orgResult.success || !orgResult.data) {
    return { success: false, error: "Organization not found" };
  }
  const org = orgResult.data;

  if (org.organizationSettings && !org.organizationSettings.allowUserInvites) {
    return {
      success: false,
      error: "Invitations are disabled for this organization",
    };
  }

  const results: { email: string; success: boolean; error?: string }[] = [];

  for (const rawEmail of data.emails) {
    const email = rawEmail.trim().toLowerCase();
    if (!email) continue;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      results.push({ email, success: false, error: "Invalid email address" });
      continue;
    }

    // Already a member? (by work or personal email)
    const existingUser = await getUserByEmail(email);
    if (existingUser.data) {
      const membership = await getUserOrganizationMembership({
        userId: existingUser.data.id,
        organizationId: orgId,
      });
      if (membership.data) {
        results.push({ email, success: false, error: "Already a member" });
        continue;
      }
    }

    // Check for existing pending invite (expired/revoked ones are re-issued by createOrganizationInvite)
    const existingInviteResult = await getOrganizationInviteByEmail(
      orgId,
      email,
    );
    if (existingInviteResult.success && existingInviteResult.data) {
      const existing = existingInviteResult.data;
      if (
        !existing.revokedAt &&
        !existing.acceptedAt &&
        existing.expiresAt > new Date()
      ) {
        results.push({ email, success: false, error: "Already invited" });
        continue;
      }
    }

    const expiresAt = new Date(
      Date.now() + INVITE_EXPIRY_HOURS * 60 * 60 * 1000,
    );

    const inviteResult = await createOrganizationInvite({
      organizationId: orgId,
      email,
      role: data.role,
      invitedById: userId,
      message: data.message,
      expiresAt,
    });

    if (!inviteResult.success || !inviteResult.data) {
      results.push({
        email,
        success: false,
        error: inviteResult.error ?? "Failed to create invite",
      });
      continue;
    }

    const invite = inviteResult.data;
    const inviteLink = `${constServer.AUTH_URL}/invite?token=${invite.token}`;

    const sent = await sendOrgInviteEmail(email, {
      inviterName: userName,
      orgName: org.name,
      role: data.role,
      inviteLink,
      message: data.message,
      expiresInHours: INVITE_EXPIRY_HOURS,
    });

    results.push(
      sent.success
        ? { email, success: true }
        : {
            email,
            success: false,
            error: "Invite created but the email could not be sent",
          },
    );
  }

  revalidatePath(`/org/${orgSlug}/admin/members`);

  const allSuccess = results.every(r => r.success);
  const anySuccess = results.some(r => r.success);

  return {
    success: anySuccess,
    results,
    error: allSuccess ? undefined : "Some invitations could not be sent",
  };
}

/**
 * Revoke a pending invitation
 */
export async function revokeInviteAction(orgSlug: string, inviteId: string) {
  const { error, orgId } = await verifyAdminAccess(orgSlug);
  if (error || !orgId) {
    return { success: false, error: error ?? "Organization not found" };
  }

  const result = await revokeOrganizationInvite(inviteId, orgId);

  if (result.success) {
    revalidatePath(`/org/${orgSlug}/admin/members`);
  }

  return result;
}

/**
 * Resend a pending invitation (refreshes the expiry)
 */
export async function resendInviteAction(orgSlug: string, inviteId: string) {
  const { error, userId, orgId, userName } = await verifyAdminAccess(orgSlug);
  if (error || !userId || !orgId) {
    return { success: false, error: error ?? "Organization not found" };
  }

  const orgResult = await getOrganizationBySlug(orgSlug);
  if (!orgResult.success || !orgResult.data) {
    return { success: false, error: "Organization not found" };
  }
  const org = orgResult.data;

  const expiresAt = new Date(Date.now() + INVITE_EXPIRY_HOURS * 60 * 60 * 1000);
  const refreshResult = await resendOrganizationInvite(
    inviteId,
    orgId,
    expiresAt,
  );

  if (!refreshResult.success || !refreshResult.data) {
    return {
      success: false,
      error: refreshResult.error ?? "Failed to resend invite",
    };
  }

  const invite = refreshResult.data;
  const inviteLink = `${constServer.AUTH_URL}/invite?token=${invite.token}`;

  const sent = await sendOrgInviteEmail(invite.email, {
    inviterName: userName,
    orgName: org.name,
    role: invite.role,
    inviteLink,
    expiresInHours: INVITE_EXPIRY_HOURS,
  });

  revalidatePath(`/org/${orgSlug}/admin/members`);
  if (!sent.success) {
    return {
      success: false,
      error: "Invite refreshed but the email could not be sent",
    };
  }
  return { success: true };
}

/**
 * Get pending invitations for the org (for server-side rendering)
 */
export async function getPendingInvitesAction(orgSlug: string) {
  const { error, orgId } = await verifyAdminAccess(orgSlug);
  if (error || !orgId) {
    return {
      success: false,
      error: error ?? "Organization not found",
      data: [],
    };
  }

  const result = await listPendingOrganizationInvites(orgId);
  return result;
}

const ROLES: readonly OrganizationRole[] = ["OWNER", "ADMIN", "MEMBER"];

// Who may change whom: never yourself (no self-lockout), and only an OWNER may
// touch an OWNER or grant OWNER. The repo refuses to leave the org without an OWNER.
async function authorizeMemberChange(
  orgSlug: string,
  targetUserId: string,
  newRole?: OrganizationRole,
): Promise<
  | { ok: false; error: string }
  | { ok: true; actorId: string; orgId: string; targetRole: OrganizationRole }
> {
  const { error, userId, orgId, role } = await verifyAdminAccess(orgSlug);
  if (error || !userId || !orgId) {
    return { ok: false, error: error ?? "Organization not found" };
  }
  if (targetUserId === userId) {
    return { ok: false, error: "You cannot change your own membership" };
  }
  const target = await getUserOrganizationMembership({
    userId: targetUserId,
    organizationId: orgId,
  });
  if (!target.data) {
    return { ok: false, error: "Member not found" };
  }
  if (
    role !== "OWNER" &&
    (target.data.role === "OWNER" || newRole === "OWNER")
  ) {
    return { ok: false, error: "Only an owner can change an owner" };
  }
  return { ok: true, actorId: userId, orgId, targetRole: target.data.role };
}

export async function changeMemberRoleAction(
  orgSlug: string,
  targetUserId: string,
  newRole: OrganizationRole,
): Promise<{ success: boolean; error?: string }> {
  if (!ROLES.includes(newRole)) {
    return { success: false, error: "Invalid role" };
  }
  const authz = await authorizeMemberChange(orgSlug, targetUserId, newRole);
  if (!authz.ok) return { success: false, error: authz.error };
  if (authz.targetRole === newRole) return { success: true };

  const result = await updateOrganizationMemberRole({
    userId: targetUserId,
    organizationId: authz.orgId,
    role: newRole,
  });
  if (!result.success) return { success: false, error: result.error };

  await auditHelpers.logMemberAction(
    authz.orgId,
    authz.actorId,
    "MEMBER_ROLE_CHANGED",
    targetUserId,
    { from: authz.targetRole, to: newRole },
  );
  revalidatePath(`/org/${orgSlug}/admin/members`);
  return { success: true };
}

export async function removeMemberAction(
  orgSlug: string,
  targetUserId: string,
): Promise<{ success: boolean; error?: string }> {
  const authz = await authorizeMemberChange(orgSlug, targetUserId);
  if (!authz.ok) return { success: false, error: authz.error };

  const result = await removeOrganizationMember({
    userId: targetUserId,
    organizationId: authz.orgId,
    actorId: authz.actorId,
  });
  if (!result.success) return { success: false, error: result.error };

  await auditHelpers.logMemberAction(
    authz.orgId,
    authz.actorId,
    "MEMBER_REMOVED",
    targetUserId,
    { role: authz.targetRole },
  );
  revalidatePath(`/org/${orgSlug}/admin/members`);
  return { success: true };
}

// Any admin may set any member's level, their own and owners' included: a level
// grants no access, so the role rules of authorizeMemberChange do not apply
export async function changeMemberLevelAction(
  orgSlug: string,
  targetUserId: string,
  levelId: string | null,
): Promise<{ success: boolean; error?: string }> {
  const { error, userId, orgId } = await verifyAdminAccess(orgSlug);
  if (error || !userId || !orgId) {
    return { success: false, error: error ?? "Organization not found" };
  }

  const result = await setOrganizationMemberLevel(orgId, targetUserId, levelId);
  if (!result.success) return { success: false, error: result.error };
  if (result.data.from === result.data.to) return { success: true };

  await auditHelpers.logMemberAction(
    orgId,
    userId,
    "MEMBER_LEVEL_CHANGED",
    targetUserId,
    result.data,
  );
  revalidatePath(`/org/${orgSlug}/admin/members`);
  revalidatePath(`/org/${orgSlug}/admin/levels`);
  return { success: true };
}
