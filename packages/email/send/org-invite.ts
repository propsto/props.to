import { OrgInviteEmail } from "../templates";
import type { Email, HandleEmailEvent } from "../types";
import { handleError } from "../utils/error-handling";
import { handleSuccess } from "../utils/success-handling";
import { send } from ".";

export async function sendOrgInviteEmail(
  email: Email,
  data: {
    inviterName?: string;
    orgName: string;
    role: string;
    inviteLink: string;
    message?: string;
    expiresInHours?: number;
  },
): Promise<HandleEmailEvent> {
  try {
    const sent = await send(
      email,
      `You've been invited to join ${data.orgName} on Props.to`,
      OrgInviteEmail,
      data,
    );
    return handleSuccess(sent);
  } catch (e) {
    return handleError(e);
  }
}
