import { redirect } from "next/navigation";
import { type User } from "next-auth";
import { auth } from "@/server/auth.server";
import { WelcomeStepper } from "@components/welcome-stepper";
import {
  stepNames,
  type OrganizationStatus,
  type LinkAccountStatus,
} from "@components/welcome-stepper/steps";
import {
  getOrganizationByHostedDomain,
  isUserMemberOfDomain,
  getPendingAccountLink,
} from "@propsto/data/repos";
import { mayAutoJoinByDomain } from "@propsto/data/utils/domain-membership";
import { canUserMoveOn } from "@/lib/post-auth-check";
import { constServer } from "@propsto/constants/server";
import { isAllowedRedirect } from "@/lib/callback-url";

export default async function WelcomePage({
  searchParams,
}: Readonly<{
  searchParams: Promise<Record<string, string | undefined>>;
}>): Promise<React.ReactElement> {
  const params = await searchParams;
  const session = await auth();
  // Where to land after onboarding (an invite link, for instance); the stepper keeps it across steps
  const callbackUrl =
    params.callbackUrl &&
    isAllowedRedirect(
      params.callbackUrl,
      constServer.AUTH_URL,
      constServer.PROPSTO_HOST,
    )
      ? params.callbackUrl
      : undefined;
  const user = session?.user as
    | (User & {
        id: string;
        email: string;
        hostedDomain?: string | null;
        isGoogleWorkspaceAdmin?: boolean;
      })
    | undefined;

  // Check for pending account link token
  let linkStatus: LinkAccountStatus = "none";
  let pendingLinkToken: string | null = null;
  let pendingLinkEmail: string | null = null;

  if (params.token) {
    const pendingLink = await getPendingAccountLink(params.token);
    if (pendingLink.success && pendingLink.data) {
      linkStatus = "pending";
      pendingLinkToken = params.token;
      pendingLinkEmail = pendingLink.data.email;
    }
  }

  // For account linking flow, user might not be authenticated yet
  // Use the email from the pending link if available
  const effectiveEmail = user?.email ?? pendingLinkEmail;
  const effectiveId = user?.id;

  if (!effectiveEmail) {
    // No user session and no pending link - redirect to sign in
    redirect("/error?code=InvalidSession");
  }

  // If we have a pending link but no session, the user needs to complete linking
  // They'll be unauthenticated, so we show the link-account step
  if (linkStatus === "pending" && !user) {
    // Special handling for unauthenticated account linking
    const queryStep = params.step ?? "link-account";
    const initialStep = stepNames.includes(queryStep)
      ? queryStep
      : "link-account";

    // Create a minimal user object for the stepper with pending link data
    const pendingLink = await getPendingAccountLink(params.token!);
    const pendingUser = {
      id: "", // Will be resolved after linking
      email: pendingLinkEmail!,
      hostedDomain: pendingLink.data?.hostedDomain ?? null,
      isGoogleWorkspaceAdmin: pendingLink.data?.isGoogleWorkspaceAdmin ?? false,
      pendingLinkToken,
    };

    return (
      <WelcomeStepper
        user={pendingUser}
        initialStep={initialStep}
        orgStatus="none"
        linkStatus={linkStatus}
      />
    );
  }

  // Normal authenticated flow
  if (!effectiveId) {
    redirect("/error?code=InvalidSession");
  }

  // Check if organization exists for user's domain and if user is already a member
  let orgStatus: OrganizationStatus = "none";
  // Org exists for the domain but this user can't auto-join it (invite-only):
  // tells the pending step to say "ask for an invite", not "not set up yet".
  let orgInviteOnly = false;
  if (user?.hostedDomain) {
    // First check if user is already a member of an org with this domain
    const membershipResult = await isUserMemberOfDomain(
      user.id,
      user.hostedDomain,
    );
    if (membershipResult.success && membershipResult.data) {
      // User is already a member - skip org steps
      orgStatus = "member";
    } else {
      // Check if org exists for this domain
      const orgResult = await getOrganizationByHostedDomain(user.hostedDomain);
      if (orgResult.success && orgResult.data) {
        const mayJoin = mayAutoJoinByDomain({
          autoJoinByDomain:
            orgResult.data.organizationSettings?.autoJoinByDomain ?? false,
          isGoogleWorkspaceAdmin: user.isGoogleWorkspaceAdmin ?? false,
        });
        // When they can't auto-join, route to the non-blocking pending step
        // (same as "no org") so onboarding isn't a dead end on a join they
        // can't complete — the invite flow adds them separately.
        orgStatus = mayJoin ? "exists" : "not_exists";
        orgInviteOnly = !mayJoin;
      } else {
        orgStatus = "not_exists";
      }
    }
  }

  // Determine initial step based on link status and query param
  const defaultStep = linkStatus === "pending" ? "link-account" : "personal";
  const queryStep = params.step ?? defaultStep;
  const initialStep = stepNames.includes(queryStep) ? queryStep : defaultStep;

  // If user has completed onboarding, redirect them to the app
  // (but not if they're in the middle of account linking)
  if (linkStatus === "none" && canUserMoveOn(user!, orgStatus, linkStatus)) {
    return redirect(callbackUrl ?? constServer.PROPSTO_APP_URL);
  }

  return (
    <WelcomeStepper
      user={{
        ...user!,
        pendingLinkToken,
      }}
      initialStep={initialStep}
      orgStatus={orgStatus}
      orgInviteOnly={orgInviteOnly}
      linkStatus={linkStatus}
      callbackUrl={callbackUrl}
    />
  );
}
