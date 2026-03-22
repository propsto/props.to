import { redirect } from "next/navigation";
import { constServer } from "@propsto/constants/server";
import { auth } from "@/server/auth.server";
import {
  getOrganizationInviteByToken,
  acceptOrganizationInvite,
  addOrganizationMember,
  getUserOrganizationMembership,
} from "@propsto/data/repos";

interface InvitePageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function InvitePage({
  searchParams,
}: InvitePageProps): Promise<React.ReactElement> {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="mx-auto text-center flex flex-col justify-center space-y-4 w-80 h-full">
        <h1 className="text-xl font-semibold">Invalid Invitation</h1>
        <p className="text-sm text-muted-foreground">
          This invitation link is missing or invalid.
        </p>
      </div>
    );
  }

  // Look up the invite
  const inviteResult = await getOrganizationInviteByToken(token);

  if (!inviteResult.success || !inviteResult.data) {
    return (
      <div className="mx-auto text-center flex flex-col justify-center space-y-4 w-80 h-full">
        <h1 className="text-xl font-semibold">Invitation Not Found</h1>
        <p className="text-sm text-muted-foreground">
          This invitation link is invalid or has already been used.
        </p>
      </div>
    );
  }

  const invite = inviteResult.data;

  // Check expiry
  if (invite.expiresAt < new Date()) {
    return (
      <div className="mx-auto text-center flex flex-col justify-center space-y-4 w-80 h-full">
        <h1 className="text-xl font-semibold">Invitation Expired</h1>
        <p className="text-sm text-muted-foreground">
          This invitation has expired. Please ask an admin to send a new one.
        </p>
      </div>
    );
  }

  // Check if already accepted or revoked
  if (invite.acceptedAt || invite.revokedAt) {
    return (
      <div className="mx-auto text-center flex flex-col justify-center space-y-4 w-80 h-full">
        <h1 className="text-xl font-semibold">Invitation No Longer Valid</h1>
        <p className="text-sm text-muted-foreground">
          This invitation has already been used or revoked.
        </p>
      </div>
    );
  }

  // Check if user is signed in
  const session = await auth();

  if (!session?.user?.id) {
    // Redirect to sign-in, passing the invite token in the callbackUrl
    const callbackUrl = `${constServer.AUTH_URL}/invite?token=${token}`;
    return redirect(`/?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  const userId = session.user.id;
  const orgSlug = invite.organization.slug.slug;

  // Check if already a member
  const existingMembership = await getUserOrganizationMembership({
    userId,
    organizationId: invite.organizationId,
  });

  if (existingMembership.success && existingMembership.data) {
    // Already a member — just redirect to the org
    return redirect(`${constServer.PROPSTO_APP_URL}/org/${orgSlug}`);
  }

  // Accept the invite and add to org
  const [acceptResult, memberResult] = await Promise.all([
    acceptOrganizationInvite(token),
    addOrganizationMember({
      userId,
      organizationId: invite.organizationId,
      role: invite.role,
    }),
  ]);

  if (!acceptResult.success || !memberResult.success) {
    return (
      <div className="mx-auto text-center flex flex-col justify-center space-y-4 w-80 h-full">
        <h1 className="text-xl font-semibold">Something Went Wrong</h1>
        <p className="text-sm text-muted-foreground">
          We couldn&apos;t process your invitation. Please try again or contact
          support.
        </p>
      </div>
    );
  }

  // Redirect to the org in the app
  redirect(`${constServer.PROPSTO_APP_URL}/org/${orgSlug}`);
}
