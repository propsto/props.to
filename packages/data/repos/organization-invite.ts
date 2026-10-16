import { randomBytes } from "node:crypto";
import type { OrganizationRole } from "@prisma/client";
import { createLogger } from "@propsto/logger";
import { db } from "../db";
import { handleError } from "../utils/error-handling";
import { handleSuccess } from "../utils/success-handling";

const logger = createLogger("data");

const newToken = (): string => randomBytes(32).toString("base64url");

const inviteInclude = {
  organization: { include: { slug: true } },
  invitedBy: { select: { firstName: true, lastName: true, email: true } },
} as const;

// Create (or re-issue) an invite. One row per org+email; an expired, revoked or
// accepted invite is reset with a fresh token instead of failing the unique constraint.
export async function createOrganizationInvite(data: {
  organizationId: string;
  email: string;
  role: OrganizationRole;
  invitedById: string;
  message?: string;
  expiresAt: Date;
}) {
  try {
    const email = data.email.toLowerCase();
    logger("createOrganizationInvite", { organizationId: data.organizationId, email });
    const fields = {
      role: data.role,
      invitedById: data.invitedById,
      message: data.message,
      expiresAt: data.expiresAt,
      token: newToken(),
      acceptedAt: null,
      revokedAt: null,
    };
    const invite = await db.organizationInvite.upsert({
      where: { organizationId_email: { organizationId: data.organizationId, email } },
      create: { organizationId: data.organizationId, email, ...fields },
      update: fields,
    });
    return handleSuccess(invite);
  } catch (e) {
    return handleError(e);
  }
}

// Get invite by token (for accept flow)
export async function getOrganizationInviteByToken(token: string) {
  try {
    logger("getOrganizationInviteByToken");
    const invite = await db.organizationInvite.findUnique({
      where: { token },
      include: inviteInclude,
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

// Revoke an invite. Scoped to the org so an admin cannot revoke another org's invite by id.
export async function revokeOrganizationInvite(inviteId: string, organizationId: string) {
  try {
    logger("revokeOrganizationInvite", { inviteId, organizationId });
    const { count } = await db.organizationInvite.updateMany({
      where: { id: inviteId, organizationId, acceptedAt: null },
      data: { revokedAt: new Date() },
    });
    if (count === 0) throw new Error("Invite not found");
    return handleSuccess({ id: inviteId });
  } catch (e) {
    return handleError(e);
  }
}

// Resend an invite: new expiry, new token, un-revoked. Scoped to the org.
export async function resendOrganizationInvite(
  inviteId: string,
  organizationId: string,
  expiresAt: Date,
) {
  try {
    logger("resendOrganizationInvite", { inviteId, organizationId });
    // Single conditional update: an acceptance that lands first makes this a no-op error
    const invite = await db.organizationInvite.update({
      where: { id: inviteId, organizationId, acceptedAt: null },
      data: { expiresAt, revokedAt: null, token: newToken() },
      include: inviteInclude,
    });
    return handleSuccess(invite);
  } catch (e) {
    return handleError(e);
  }
}

// Accept an invite and join the org in one transaction. The conditional update makes
// acceptance single-use even under concurrent requests; membership is idempotent.
export async function acceptOrganizationInvite(token: string, userId: string) {
  try {
    logger("acceptOrganizationInvite", { userId });
    const invite = await db.$transaction(async tx => {
      const now = new Date();
      const { count } = await tx.organizationInvite.updateMany({
        where: { token, acceptedAt: null, revokedAt: null, expiresAt: { gt: now } },
        data: { acceptedAt: now },
      });
      if (count === 0) throw new Error("Invite is no longer valid");
      const accepted = await tx.organizationInvite.findUniqueOrThrow({
        where: { token },
        include: inviteInclude,
      });
      await tx.organizationMember.upsert({
        where: {
          userId_organizationId: { userId, organizationId: accepted.organizationId },
        },
        create: { userId, organizationId: accepted.organizationId, role: accepted.role },
        update: {},
      });
      return accepted;
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
