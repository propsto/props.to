// Pure rules for accepting an org invite. Kept out of the server action so they can be unit tested.

import { emailMatchesDomain } from "@propsto/data/utils/domain-membership";

export interface InviteState {
  email: string;
  expiresAt: Date;
  acceptedAt: Date | null;
  revokedAt: Date | null;
}

export interface InviteUser {
  email?: string | null;
  personalEmail?: string | null;
  personalEmailVerified?: Date | null;
}

export type InviteRejection =
  | "expired"
  | "used"
  | "wrong-account"
  | "off-domain";

// Returns why the signed-in user cannot accept this invite, or null when they can.
// A Workspace org (hostedDomain set) accepts company addresses only, even for an
// invite issued before the policy — so an off-domain invite already sent can't be
// accepted. New and resent off-domain invites are already blocked upstream.
export function inviteRejection(
  invite: InviteState,
  user: InviteUser,
  hostedDomain?: string | null,
  now: Date = new Date(),
): InviteRejection | null {
  if (invite.acceptedAt || invite.revokedAt) return "used";
  if (invite.expiresAt <= now) return "expired";
  if (hostedDomain && !emailMatchesDomain(invite.email, hostedDomain))
    return "off-domain";
  const target = invite.email.toLowerCase();
  const own = [
    user.email,
    user.personalEmailVerified ? user.personalEmail : null,
  ]
    .filter((e): e is string => Boolean(e))
    .map(e => e.toLowerCase());
  return own.includes(target) ? null : "wrong-account";
}
