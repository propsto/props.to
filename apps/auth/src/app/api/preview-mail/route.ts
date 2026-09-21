import { NextResponse } from "next/server";
import { constServer } from "@propsto/constants/server";
import { listOutboxEmails } from "@propsto/data/repos";
import { auth } from "@/server/auth.server";

// Read back captured emails on preview deployments (EMAIL_PROVIDER=outbox).
// 404 everywhere else, and a session is required so previews are not an open mailbox.
export async function GET(request: Request): Promise<NextResponse> {
  if (constServer.EMAIL_PROVIDER !== "outbox") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const to = new URL(request.url).searchParams.get("to");
  if (!to) {
    return NextResponse.json({ error: "Missing ?to=" }, { status: 400 });
  }
  const result = await listOutboxEmails(to);
  return NextResponse.json(result.data ?? []);
}
