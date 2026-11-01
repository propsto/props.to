import { randomBytes } from "node:crypto";
import { createLogger } from "@propsto/logger";
import { db } from "../db";
import { handleError } from "../utils/error-handling";
import { handleSuccess } from "../utils/success-handling";

const logger = createLogger("data");

const EXPIRATION_MINUTES = 15;

export type PendingAccountLinkData = {
  email: string;
  provider: string;
  providerAccountId: string;
  accessToken?: string | null;
  refreshToken?: string | null;
  expiresAt?: number | null;
  hostedDomain?: string | null;
  isGoogleWorkspaceAdmin?: boolean;
};

/**
 * Stores the OAuth data of a Google sign-in that must be linked to an existing
 * account. Only the returned random token leaves the server (in URLs and the
 * magic link email); the OAuth tokens stay in the database. Expires in 15 minutes.
 */
export async function createPendingAccountLink(data: PendingAccountLinkData) {
  try {
    const token = randomBytes(32).toString("base64url");
    const expires = new Date(Date.now() + EXPIRATION_MINUTES * 60 * 1000);

    logger("createPendingAccountLink", { email: data.email, expires });

    // One pending link per email: a new Google sign-in replaces the old one.
    const pendingLink = await db.pendingAccountLink.upsert({
      where: { email: data.email },
      create: { token, email: data.email, data, expires },
      update: { token, data, expires },
    });

    return handleSuccess({
      token: pendingLink.token,
      email: pendingLink.email,
      expires: pendingLink.expires,
    });
  } catch (e) {
    return handleError(e);
  }
}

/**
 * Retrieves a pending account link by token.
 * Returns null if the token is expired or not found.
 */
export async function getPendingAccountLink(token: string) {
  try {
    logger("getPendingAccountLink", { token: token.slice(0, 8) + "..." });

    const pendingLink = await db.pendingAccountLink.findFirst({
      where: { token, expires: { gt: new Date() } },
    });

    if (!pendingLink) {
      return handleSuccess(null);
    }

    return handleSuccess({
      ...(pendingLink.data as PendingAccountLinkData),
      token: pendingLink.token,
      expires: pendingLink.expires,
    });
  } catch (e) {
    return handleError(e);
  }
}

/**
 * Consumes (deletes) a pending account link token after successful linking.
 */
export async function consumePendingAccountLink(token: string) {
  try {
    logger("consumePendingAccountLink", { token: token.slice(0, 8) + "..." });

    const { count } = await db.pendingAccountLink.deleteMany({
      where: { token },
    });

    return handleSuccess(count > 0 ? { consumed: true } : null);
  } catch (e) {
    return handleError(e);
  }
}
