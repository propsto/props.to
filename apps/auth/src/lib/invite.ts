// Pure rules for accepting an org invite. Kept out of the server action so they can be unit tested.

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

export type InviteRejection = "expired" | "used" | "wrong-account";

// Returns why the signed-in user cannot accept this invite, or null when they can.
export function inviteRejection(
  invite: InviteState,
  user: InviteUser,
  now: Date = new Date(),
): InviteRejection | null {
  if (invite.acceptedAt || invite.revokedAt) return "used";
  if (invite.expiresAt <= now) return "expired";
  const target = invite.email.toLowerCase();
  const own = [user.email, user.personalEmailVerified ? user.personalEmail : null]
    .filter((e): e is string => Boolean(e))
    .map(e => e.toLowerCase());
  return own.includes(target) ? null : "wrong-account";
}
