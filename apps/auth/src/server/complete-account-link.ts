import { logger } from "@propsto/logger";
import {
  consumePendingAccountLink,
  linkAccount,
  updateUser,
  type PendingAccountLinkData,
} from "@propsto/data/repos";

// Attaches the pending Google account to a user who already proved they own the email
// (password or magic link). Not a server action: callers must do that check first.
export async function completeAccountLink(
  userId: string,
  pending: PendingAccountLinkData,
  token: string,
): ReturnType<typeof updateUser> {
  const linked = await linkAccount({
    userId,
    type: "oauth",
    provider: pending.provider,
    providerAccountId: pending.providerAccountId,
    access_token: pending.accessToken ?? undefined,
    refresh_token: pending.refreshToken ?? undefined,
    expires_at: pending.expiresAt ?? undefined,
  });
  if (!linked.success) {
    return {
      success: false,
      error: "Failed to link account. Please try again.",
    };
  }
  const updated = await updateUser(userId, {
    emailVerified: new Date(),
    hostedDomain: pending.hostedDomain,
    isGoogleWorkspaceAdmin: pending.isGoogleWorkspaceAdmin ?? false,
  });
  await consumePendingAccountLink(token);
  logger("info: Successfully linked Google account %o", {
    userId,
    provider: pending.provider,
    hostedDomain: pending.hostedDomain,
  });
  return updated;
}
