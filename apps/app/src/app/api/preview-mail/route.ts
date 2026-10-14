import { NextResponse } from "next/server";
import { constServer } from "@propsto/constants/server";
import { listOutboxEmails } from "@propsto/data/repos";
import { auth } from "@/server/auth.server";

// Read back captured emails on preview deployments (EMAIL_PROVIDER=outbox).
// Invites are sent from this app, so this route reads the outbox where they are written.
// 404 for every other provider; the caller can only read mail addressed to themselves.
export async function GET(request: Request): Promise<NextResponse> {
  if (constServer.EMAIL_PROVIDER !== "outbox") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const to = new URL(request.url).searchParams.get("to")?.toLowerCase();
  if (!to) {
    return NextResponse.json({ error: "Missing ?to=" }, { status: 400 });
  }
  // Only the caller's own mailbox: the outbox holds magic links and invite tokens
  const own = [
    session.user.email,
    session.user.personalEmailVerified ? session.user.personalEmail : null,
  ].map(e => e?.toLowerCase());
  if (!own.includes(to)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const result = await listOutboxEmails(to);
  return NextResponse.json(result.data ?? []);
}
