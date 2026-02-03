import { createLogger } from "@propsto/logger";
import { randomInt } from "crypto";
import { db } from "../db";
import { handleError } from "../utils/error-handling";
import { handleSuccess } from "../utils/success-handling";

const logger = createLogger("data");

const VERIFICATION_PREFIX = "personal-email:";
const EXPIRATION_MINUTES = 15;

/**
 * Generate a cryptographically secure 6-digit verification code
 */
function generateVerificationCode(): string {
  return randomInt(100000, 999999).toString();
}

/**
 * Creates a verification code for personal email verification.
 * Stores it in the VerificationToken table with a prefix.
 */
export async function createPersonalEmailVerification(
  userId: string,
  personalEmail: string,
) {
  try {
    const identifier = `${VERIFICATION_PREFIX}${userId}`;
    const expires = new Date(Date.now() + EXPIRATION_MINUTES * 60 * 1000);
    const code = generateVerificationCode();

    // Store email and code together
    const token = `${code}:${Buffer.from(personalEmail).toString("base64url")}`;

    logger("createPersonalEmailVerification", { userId, personalEmail, expires });

    // Delete any existing verification for this user
    try {
      await db.verificationToken.deleteMany({
        where: {
          identifier,
        },
      });
    } catch {
      // Ignore if no existing token
    }

    const verification = await db.verificationToken.create({
      data: {
        identifier,
        token,
        expires,
      },
    });

    return handleSuccess({
      code,
      email: personalEmail,
      expires: verification.expires,
    });
  } catch (e) {
    return handleError(e);
  }
}

/**
 * Verifies a personal email verification code.
 * Returns the email if valid, null if invalid or expired.
 */
export async function verifyPersonalEmailCode(
  userId: string,
  code: string,
) {
  try {
    const identifier = `${VERIFICATION_PREFIX}${userId}`;

    logger("verifyPersonalEmailCode", { userId, code });

    const verification = await db.verificationToken.findFirst({
      where: {
        identifier,
        expires: { gt: new Date() },
      },
    });

    if (!verification) {
      return handleSuccess({ valid: false, error: "Code expired or not found" });
    }

    // Extract code and email from token
    const [storedCode, encodedEmail] = verification.token.split(":");
    if (!storedCode || !encodedEmail) {
      return handleSuccess({ valid: false, error: "Invalid verification token" });
    }

    if (storedCode !== code) {
      return handleSuccess({ valid: false, error: "Invalid code" });
    }

    const email = Buffer.from(encodedEmail, "base64url").toString("utf-8");

    // Delete the verification token (consumed)
    await db.verificationToken.delete({
      where: {
        identifier_token: {
          identifier,
          token: verification.token,
        },
      },
    });

    // Update the user with the verified personal email
    await db.user.update({
      where: { id: userId },
      data: {
        personalEmail: email,
        personalEmailVerified: new Date(),
      },
    });

    logger("verifyPersonalEmailCode: success", { userId, email });

    return handleSuccess({ valid: true, email });
  } catch (e) {
    return handleError(e);
  }
}

/**
 * Check if user has a pending personal email verification
 */
export async function hasPendingPersonalEmailVerification(userId: string) {
  try {
    const identifier = `${VERIFICATION_PREFIX}${userId}`;

    const verification = await db.verificationToken.findFirst({
      where: {
        identifier,
        expires: { gt: new Date() },
      },
    });

    if (!verification) {
      return handleSuccess({ pending: false });
    }

    // Extract email from token
    const [, encodedEmail] = verification.token.split(":");
    const email = encodedEmail
      ? Buffer.from(encodedEmail, "base64url").toString("utf-8")
      : null;

    return handleSuccess({
      pending: true,
      email,
      expires: verification.expires,
    });
  } catch (e) {
    return handleError(e);
  }
}

/**
 * Check if a personal email is already in use by another user
 */
export async function isPersonalEmailAvailable(email: string, excludeUserId?: string) {
  try {
    logger("isPersonalEmailAvailable", { email, excludeUserId });

    const existingUser = await db.user.findFirst({
      where: {
        OR: [
          { email: { equals: email, mode: "insensitive" } },
          { personalEmail: { equals: email, mode: "insensitive" } },
        ],
        ...(excludeUserId ? { NOT: { id: excludeUserId } } : {}),
      },
    });

    return handleSuccess(!existingUser);
  } catch (e) {
    return handleError(e);
  }
}
