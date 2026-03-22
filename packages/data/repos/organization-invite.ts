import type { OrganizationRole } from "@prisma/client";
import { createLogger } from "@propsto/logger";
import { db } from "../db";
import { handleError } from "../utils/error-handling";
import { handleSuccess } from "../utils/success-handling";

const logger = createLogger("data");

// Create a new organization invite
export async function createOrganizationInvite(data: {
  organizationId: string;
  email: string;
  role: OrganizationRole;
  invitedById: string;
  message?: string;
  expiresAt: Date;
}) {
  try {
    logger("createOrganizationInvite", { organizationId: data.organizationId, email: data.email });
    const invite = await db.organizationInvite.create({
      data: {
        organizationId: data.organizationId,
        email: data.email.toLowerCase(),
        role: data.role,
        invitedById: data.invitedById,
        message: data.message,
        expiresAt: data.expiresAt,
      },
    });
    return handleSuccess(invite);
  } catch (e) {
    return handleError(e);
  }
}

// Get invite by token (for accept flow)
export async function getOrganizationInviteByToken(token: string) {
  try {
    logger("getOrganizationInviteByToken", { token });
    const invite = await db.organizationInvite.findUnique({
      where: { token },
      include: {
        organization: {
          include: { slug: true },
        },
        invitedBy: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
    });
    return handleSuccess(invite);
  } catch (e) {
    return handleError(e);
  }
}

// List pending invites for an organization
export async function listPendingOrganizationInvites(organizationId: string) {
  try {
    logger("listPendingOrganizationInvites", { organizationId });
    const invites = await db.organizationInvite.findMany({
      where: {
        organizationId,
        acceptedAt: null,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: {
        invitedBy: {
          select: { firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return handleSuccess(invites);
  } catch (e) {
    return handleError(e);
  }
}

// Revoke an invite
export async function revokeOrganizationInvite(inviteId: string) {
  try {
    logger("revokeOrganizationInvite", { inviteId });
    const invite = await db.organizationInvite.update({
      where: { id: inviteId },
      data: { revokedAt: new Date() },
    });
    return handleSuccess(invite);
  } catch (e) {
    return handleError(e);
  }
}

// Refresh an invite (update expiry and generate new token)
export async function resendOrganizationInvite(inviteId: string, expiresAt: Date) {
  try {
    logger("resendOrganizationInvite", { inviteId });
    // Generate a new token by resetting the invite
    const invite = await db.organizationInvite.update({
      where: { id: inviteId },
      data: {
        expiresAt,
        revokedAt: null,
      },
      include: {
        organization: {
          include: { slug: true },
        },
      },
    });
    return handleSuccess(invite);
  } catch (e) {
    return handleError(e);
  }
}

// Accept an invite — mark it accepted; caller must also call addOrganizationMember
export async function acceptOrganizationInvite(token: string) {
  try {
    logger("acceptOrganizationInvite", { token });
    const invite = await db.organizationInvite.update({
      where: { token },
      data: { acceptedAt: new Date() },
      include: {
        organization: {
          include: { slug: true },
        },
      },
    });
    return handleSuccess(invite);
  } catch (e) {
    return handleError(e);
  }
}

// Get existing invite for an org+email (to check for duplicates)
export async function getOrganizationInviteByEmail(organizationId: string, email: string) {
  try {
    logger("getOrganizationInviteByEmail", { organizationId, email });
    const invite = await db.organizationInvite.findUnique({
      where: {
        organizationId_email: {
          organizationId,
          email: email.toLowerCase(),
        },
      },
    });
    return handleSuccess(invite);
  } catch (e) {
    return handleError(e);
  }
}
