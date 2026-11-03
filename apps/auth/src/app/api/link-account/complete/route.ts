import { NextResponse } from "next/server";
import { getPendingAccountLink } from "@propsto/data/repos";
import { auth, updateSession } from "@/server/auth.server";
import { completeAccountLink } from "@/server/complete-account-link";

// Where the account-linking magic link lands. Clicking it signed the user in by email,
// which proves they own the account, so finish linking the pending Google sign-in here.
export async function GET(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  const to = (path: string): NextResponse =>
    NextResponse.redirect(new URL(path, url));
  const token = url.searchParams.get("token") ?? "";

  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return to("/error?code=InvalidSession");
  }
  const pending = await getPendingAccountLink(token);
  if (!pending.success || !pending.data) {
    return to("/error?code=AccountLinkingExpired");
  }
  if (pending.data.email.toLowerCase() !== session.user.email.toLowerCase()) {
    return to("/error?code=AccountLinkingFailed");
  }

  const result = await completeAccountLink(
    session.user.id,
    pending.data,
    token,
  );
  if (!result.success) {
    return to("/error?code=AccountLinkingFailed");
  }
  // The JWT reloads the user from the database, picking up the Workspace fields
  await updateSession({});
  return to("/welcome");
}
