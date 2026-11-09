"use server";

import {
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
} from "@propsto/data/repos";
import { sendOrgInviteEmail } from "@propsto/email/send/org-invite";
import { emailMatchesDomain } from "@propsto/data/utils/domain-membership";
import { revalidatePath } from "next/cache";
import { constServer } from "@propsto/constants/server";
import { inviteBatchError } from "@/lib/admin-input";
import {
  withOrgAdmin,
  ok,
  fail,
  type ActionResult,
  type OrgAdminContext,
} from "@/server/with-org-admin";
import type { OrganizationRole } from "@prisma/client";

const INVITE_EXPIRY_HOURS = 24;

type InviteResult = { email: string; success: boolean; error?: string };

/**
 * Invite one or more members to the organization by email. Each address gets
 * its own outcome in `results`: the batch succeeds even when every one failed.
 */
export async function inviteMembersAction(
  orgSlug: string,
  data: {
    emails: string[];
    role: OrganizationRole;
    message?: string;
  },
): Promise<ActionResult<{ results: InviteResult[] }>> {
  return withOrgAdmin(
    orgSlug,
    async ({ userId, userName, org: { id: orgId } }) => {
      // Refuse an oversized batch or message before any invite or email is created
      const batchError = inviteBatchError(data.emails, data.message);
      if (batchError) return fail(batchError);

      // Server-side role check: an ADMIN must not be able to mint an OWNER invite
      if (data.role !== "MEMBER" && data.role !== "ADMIN") {
        return fail("Invalid role");
      }

      // Check allowUserInvites setting
      const orgResult = await getOrganizationBySlug(orgSlug);
      if (!orgResult.success || !orgResult.data) {
        return fail("Organization not found");
      }
      const org = orgResult.data;

      if (
        org.organizationSettings &&
        !org.organizationSettings.allowUserInvites
      ) {
        return fail("Invitations are disabled for this organization");
      }

      const results: InviteResult[] = [];

      for (const rawEmail of data.emails) {
        const email = rawEmail.trim().toLowerCase();
        if (!email) continue;

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          results.push({
            email,
            success: false,
            error: "Invalid email address",
          });
          continue;
        }

        // A Workspace org invites company addresses only: a personal email can't be
        // invited — the person links a personal account after joining (or auto-joins
        // by domain). Orgs without a verified domain are unrestricted.
        if (org.hostedDomain && !emailMatchesDomain(email, org.hostedDomain)) {
          results.push({
            email,
            success: false,
            error: `Invite a @${org.hostedDomain} address — personal emails can't be invited`,
          });
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

      if (results.length === 0) {
        return fail("Please enter at least one email address");
      }

      revalidatePath(`/org/${orgSlug}/admin/members`);
      return ok({ results });
    },
  );
}

/**
 * Revoke a pending invitation
 */
export async function revokeInviteAction(
  orgSlug: string,
  inviteId: string,
): Promise<ActionResult> {
  return withOrgAdmin(orgSlug, async ({ org }) => {
    const result = await revokeOrganizationInvite(inviteId, org.id);
    if (!result.success) return fail(result.error, "Failed to revoke invite");

    revalidatePath(`/org/${orgSlug}/admin/members`);
    return ok();
  });
}

/**
 * Resend a pending invitation (refreshes the expiry)
 */
export async function resendInviteAction(
  orgSlug: string,
  inviteId: string,
): Promise<ActionResult> {
  return withOrgAdmin(orgSlug, async ({ userName, org: { id: orgId } }) => {
    const orgResult = await getOrganizationBySlug(orgSlug);
    if (!orgResult.success || !orgResult.data) {
      return fail("Organization not found");
    }
    const org = orgResult.data;

    const expiresAt = new Date(
      Date.now() + INVITE_EXPIRY_HOURS * 60 * 60 * 1000,
    );
    const refreshResult = await resendOrganizationInvite(
      inviteId,
      orgId,
      expiresAt,
      org.hostedDomain,
    );

    if (!refreshResult.success || !refreshResult.data) {
      return fail(refreshResult.error, "Failed to resend invite");
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
      return fail("Invite refreshed but the email could not be sent");
    }
    return ok();
  });
}

/**
 * Get pending invitations for the org (for server-side rendering)
 */
export async function getPendingInvitesAction(orgSlug: string) {
  return withOrgAdmin(orgSlug, async ({ org }) => {
    const result = await listPendingOrganizationInvites(org.id);
    if (!result.success) return fail(result.error, "Failed to load invites");
    return ok(result.data);
  });
}

const ROLES: readonly OrganizationRole[] = ["OWNER", "ADMIN", "MEMBER"];

// Who may change whom: never yourself (no self-lockout), and only an OWNER may
// touch an OWNER or grant OWNER. The repo refuses to leave the org without an OWNER.
async function authorizeMemberChange(
  { userId, org, role }: OrgAdminContext,
  targetUserId: string,
  newRole?: OrganizationRole,
): Promise<ActionResult<{ targetRole: OrganizationRole }>> {
  if (targetUserId === userId) {
    return fail("You cannot change your own membership");
  }
  const target = await getUserOrganizationMembership({
    userId: targetUserId,
    organizationId: org.id,
  });
  if (!target.data) return fail("Member not found");
  if (
    role !== "OWNER" &&
    (target.data.role === "OWNER" || newRole === "OWNER")
  ) {
    return fail("Only an owner can change an owner");
  }
  return ok({ targetRole: target.data.role });
}

export async function changeMemberRoleAction(
  orgSlug: string,
  targetUserId: string,
  newRole: OrganizationRole,
): Promise<ActionResult> {
  if (!ROLES.includes(newRole)) return fail("Invalid role");

  return withOrgAdmin(orgSlug, async ctx => {
    const authz = await authorizeMemberChange(ctx, targetUserId, newRole);
    if (!authz.success) return authz;
    const { targetRole } = authz.data;
    if (targetRole === newRole) return ok();

    const result = await updateOrganizationMemberRole({
      userId: targetUserId,
      organizationId: ctx.org.id,
      role: newRole,
    });
    if (!result.success) return fail(result.error);

    await ctx.audit(
      "MEMBER_ROLE_CHANGED",
      { type: "member", id: targetUserId },
      { from: targetRole, to: newRole },
    );
    revalidatePath(`/org/${orgSlug}/admin/members`);
    return ok();
  });
}

export async function removeMemberAction(
  orgSlug: string,
  targetUserId: string,
): Promise<ActionResult> {
  return withOrgAdmin(orgSlug, async ctx => {
    const authz = await authorizeMemberChange(ctx, targetUserId);
    if (!authz.success) return authz;

    const result = await removeOrganizationMember({
      userId: targetUserId,
      organizationId: ctx.org.id,
      actorId: ctx.userId,
    });
    if (!result.success) return fail(result.error);

    await ctx.audit(
      "MEMBER_REMOVED",
      { type: "member", id: targetUserId },
      { role: authz.data.targetRole },
    );
    revalidatePath(`/org/${orgSlug}/admin/members`);
    return ok();
  });
}

// Any admin may set any member's level, their own and owners' included: a level
// grants no access, so the role rules of authorizeMemberChange do not apply
export async function changeMemberLevelAction(
  orgSlug: string,
  targetUserId: string,
  levelId: string | null,
): Promise<ActionResult> {
  return withOrgAdmin(orgSlug, async ({ org, audit }) => {
    const result = await setOrganizationMemberLevel(
      org.id,
      targetUserId,
      levelId,
    );
    if (!result.success) return fail(result.error);

    // A no-op still refreshes the page, which may show a level another admin replaced
    if (result.data.from !== result.data.to) {
      await audit(
        "MEMBER_LEVEL_CHANGED",
        { type: "member", id: targetUserId },
        result.data,
      );
    }
    revalidatePath(`/org/${orgSlug}/admin/members`);
    revalidatePath(`/org/${orgSlug}/admin/levels`);
    return ok();
  });
}
