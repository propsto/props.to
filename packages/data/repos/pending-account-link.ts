import { createLogger } from "@propsto/logger";
import { db } from "../db";
import { handleError } from "../utils/error-handling";
import { handleSuccess } from "../utils/success-handling";
import { v4 as uuidv4 } from "uuid";

const logger = createLogger("data");

const PENDING_LINK_PREFIX = "account-link:";
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
 * Creates a pending account link token for OAuth account linking.
 * The OAuth data is stored encoded in the token itself for simplicity.
 * Token expires in 15 minutes.
 */
export async function createPendingAccountLink(data: PendingAccountLinkData) {
  try {
    const identifier = `${PENDING_LINK_PREFIX}${data.email}`;
    const expires = new Date(Date.now() + EXPIRATION_MINUTES * 60 * 1000);

    // Encode OAuth data in the token (base64)
    const oauthDataEncoded = Buffer.from(JSON.stringify(data)).toString(
      "base64url",
    );
    const uniqueId = uuidv4().slice(0, 8);
    const token = `${uniqueId}.${oauthDataEncoded}`;

    logger("createPendingAccountLink", { email: data.email, expires });

    // Delete any existing pending link for this email first
    try {
      await db.verificationToken.deleteMany({
        where: {
          identifier: { startsWith: `${PENDING_LINK_PREFIX}${data.email}` },
        },
      });
    } catch {
      // Ignore if no existing token
    }

    const pendingLink = await db.verificationToken.create({
      data: {
        identifier,
        token,
        expires,
      },
    });

    return handleSuccess({
      token: pendingLink.token,
      email: data.email,
      expires: pendingLink.expires,
    });
  } catch (e) {
    return handleError(e);
  }
}

/**
 * Retrieves a pending account link by token.
 * Decodes the OAuth data from the token.
 * Returns null if token is expired or not found.
 */
export async function getPendingAccountLink(token: string) {
  try {
    logger("getPendingAccountLink", { token: token.slice(0, 8) + "..." });

    // Extract email from token by finding the verification token
    const pendingLink = await db.verificationToken.findFirst({
      where: {
        token,
        identifier: { startsWith: PENDING_LINK_PREFIX },
        expires: { gt: new Date() },
      },
    });

    if (!pendingLink) {
      return handleSuccess(null);
    }

    // Decode OAuth data from token
    const [, encodedData] = token.split(".");
    if (!encodedData) {
      return handleSuccess(null);
    }

    const oauthData = JSON.parse(
      Buffer.from(encodedData, "base64url").toString("utf-8"),
    ) as PendingAccountLinkData;

    return handleSuccess({
      ...oauthData,
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

    // Find the token first to get the identifier
    const pendingLink = await db.verificationToken.findFirst({
      where: {
        token,
        identifier: { startsWith: PENDING_LINK_PREFIX },
      },
    });

    if (!pendingLink) {
      return handleSuccess(null);
    }

    // Delete the token
    await db.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: pendingLink.identifier,
          token: pendingLink.token,
        },
      },
    });

    return handleSuccess({ consumed: true });
  } catch (e) {
    return handleError(e);
  }
}

/**
 * Checks if a pending account link exists for an email.
 */
export async function hasPendingAccountLink(email: string) {
  try {
    logger("hasPendingAccountLink", { email });

    const pendingLink = await db.verificationToken.findFirst({
      where: {
        identifier: `${PENDING_LINK_PREFIX}${email}`,
        expires: { gt: new Date() },
      },
    });

    return handleSuccess(Boolean(pendingLink));
  } catch (e) {
    return handleError(e);
  }
}
