import { redirect } from "next/navigation";
import { constServer } from "@propsto/constants/server";
import { auth } from "@/server/auth.server";
import { getOrganizationInviteByToken } from "@propsto/data/repos";
import { inviteRejection } from "@/lib/invite";
import { AcceptInviteForm } from "./accept-invite-form";

interface InvitePageProps {
  searchParams: Promise<{ token?: string }>;
}

function Message({ title, body }: { title: string; body: string }): React.ReactElement {
  return (
    <div className="mx-auto text-center flex flex-col justify-center space-y-4 w-80 h-full">
      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

// GET only shows the invite; accepting happens on POST so link previews and mail scanners cannot consume it.
export default async function InvitePage({
  searchParams,
}: InvitePageProps): Promise<React.ReactElement> {
  const { token } = await searchParams;

  if (!token) {
    return <Message title="Invalid Invitation" body="This invitation link is missing or invalid." />;
  }

  const inviteResult = await getOrganizationInviteByToken(token);
  if (!inviteResult.success || !inviteResult.data) {
    return (
      <Message
        title="Invitation Not Found"
        body="This invitation link is invalid or has already been used."
      />
    );
  }
  const invite = inviteResult.data;

  const session = await auth();
  if (!session?.user?.id) {
    const callbackUrl = `${constServer.AUTH_URL}/invite?token=${token}`;
    redirect(`/?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  const rejection = inviteRejection(invite, session.user);
  if (rejection === "expired") {
    return (
      <Message
        title="Invitation Expired"
        body="This invitation has expired. Please ask an admin to send a new one."
      />
    );
  }
  if (rejection === "used") {
    return (
      <Message
        title="Invitation No Longer Valid"
        body="This invitation has already been used or revoked."
      />
    );
  }
  if (rejection === "wrong-account") {
    return (
      <Message
        title="Wrong Account"
        body={`This invitation was sent to ${invite.email}. You are signed in as ${session.user.email ?? "another account"}.`}
      />
    );
  }

  const inviter =
    [invite.invitedBy.firstName, invite.invitedBy.lastName].filter(Boolean).join(" ") ||
    invite.invitedBy.email;

  return (
    <div className="mx-auto text-center flex flex-col justify-center space-y-4 w-80 h-full">
      <h1 className="text-xl font-semibold">Join {invite.organization.name}</h1>
      <p className="text-sm text-muted-foreground">
        {inviter} invited you to join as {invite.role.toLowerCase()}.
      </p>
      {invite.message ? (
        <p className="text-sm italic text-muted-foreground">&ldquo;{invite.message}&rdquo;</p>
      ) : null}
      <AcceptInviteForm token={token} />
    </div>
  );
}
