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

  // Check allowUserInvites setting
  const orgResult = await getOrganizationBySlug(orgSlug);
  if (!orgResult.success || !orgResult.data) {
    return { success: false, error: "Organization not found" };
  }
  const org = orgResult.data;

  if (org.organizationSettings && !org.organizationSettings.allowUserInvites) {
    return { success: false, error: "Invitations are disabled for this organization" };
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

    // Check for existing pending invite
    const existingInviteResult = await getOrganizationInviteByEmail(orgId, email);
    if (existingInviteResult.success && existingInviteResult.data) {
      const existing = existingInviteResult.data;
      if (!existing.revokedAt && !existing.acceptedAt && existing.expiresAt > new Date()) {
        results.push({ email, success: false, error: "Already invited" });
        continue;
      }
    }

    const expiresAt = new Date(Date.now() + INVITE_EXPIRY_HOURS * 60 * 60 * 1000);

    const inviteResult = await createOrganizationInvite({
      organizationId: orgId,
      email,
      role: data.role,
      invitedById: userId,
      message: data.message,
      expiresAt,
    });

    if (!inviteResult.success || !inviteResult.data) {
      results.push({ email, success: false, error: inviteResult.error ?? "Failed to create invite" });
      continue;
    }

    const invite = inviteResult.data;
    const inviteLink = `${constServer.AUTH_URL}/invite?token=${invite.token}`;

    await sendOrgInviteEmail(email, {
      inviterName: userName,
      orgName: org.name,
      role: data.role,
      inviteLink,
      message: data.message,
      expiresInHours: INVITE_EXPIRY_HOURS,
    });

    results.push({ email, success: true });
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

  const result = await revokeOrganizationInvite(inviteId);

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
  const refreshResult = await resendOrganizationInvite(inviteId, expiresAt);

  if (!refreshResult.success || !refreshResult.data) {
    return { success: false, error: refreshResult.error ?? "Failed to resend invite" };
  }

  const invite = refreshResult.data;
  const inviteLink = `${constServer.AUTH_URL}/invite?token=${invite.token}`;

  await sendOrgInviteEmail(invite.email, {
    inviterName: userName,
    orgName: org.name,
    role: invite.role,
    inviteLink,
    expiresInHours: INVITE_EXPIRY_HOURS,
  });

  revalidatePath(`/org/${orgSlug}/admin/members`);
  return { success: true };
}

/**
 * Get pending invitations for the org (for server-side rendering)
 */
export async function getPendingInvitesAction(orgSlug: string) {
  const { error, orgId } = await verifyAdminAccess(orgSlug);
  if (error || !orgId) {
    return { success: false, error: error ?? "Organization not found", data: [] };
  }

  const result = await listPendingOrganizationInvites(orgId);
  return result;
}
