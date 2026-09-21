"use server";

import { redirect } from "next/navigation";
import { constServer } from "@propsto/constants/server";
import {
  getOrganizationInviteByToken,
  acceptOrganizationInvite,
  getUser,
} from "@propsto/data/repos";
import { auth } from "@/server/auth.server";
import { inviteRejection } from "@/lib/invite";

export type AcceptInviteState = { error?: string } | undefined;

const MESSAGES = {
  expired: "This invitation has expired. Please ask an admin to send a new one.",
  used: "This invitation has already been used or revoked.",
  "wrong-account": "This invitation was sent to a different email address. Sign in with that account to accept it.",
};

export async function acceptInviteAction(
  _prev: AcceptInviteState,
  formData: FormData,
): Promise<AcceptInviteState> {
  const token = formData.get("token");
  if (typeof token !== "string" || !token) return { error: "Invalid invitation." };

  const session = await auth();
  if (!session?.user?.id) {
    const callbackUrl = `${constServer.AUTH_URL}/invite?token=${token}`;
    redirect(`/?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  const inviteResult = await getOrganizationInviteByToken(token);
  if (!inviteResult.data) return { error: "Invitation not found." };
  const invite = inviteResult.data;

  // Compare against the DB user, not the JWT copy
  const dbUser = await getUser({ id: session.user.id });
  if (!dbUser.data) return { error: "Invitation not found." };
  const rejection = inviteRejection(invite, dbUser.data);
  if (rejection) return { error: MESSAGES[rejection] };

  // Always consume the token, even for an existing member, so it cannot be reused by another account
  const accepted = await acceptOrganizationInvite(token, session.user.id);
  if (!accepted.success) return { error: accepted.error ?? "Could not accept the invitation." };

  // ponytail: members have no org landing page yet (gate 4), so land on the dashboard
  redirect(constServer.PROPSTO_APP_URL);
}
