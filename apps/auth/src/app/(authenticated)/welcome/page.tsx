import { redirect } from "next/navigation";
import { type User } from "next-auth";
import { auth } from "@/server/auth.server";
import { WelcomeStepper } from "@components/welcome-stepper";
import {
  stepNames,
  type OrganizationStatus,
} from "@components/welcome-stepper/steps";
import {
  getOrganizationByHostedDomain,
  isUserMemberOfDomain,
} from "@propsto/data/repos";
import { canUserMoveOn } from "@/lib/post-auth-check";
import { constServer } from "@propsto/constants/server";

export default async function WelcomePage({
  searchParams,
}: Readonly<{
  searchParams: Promise<Record<string, string | undefined>>;
}>): Promise<React.ReactElement> {
  const session = await auth();
  const user = session?.user as
    | (User & {
        id: string;
        email: string;
        hostedDomain?: string | null;
        isGoogleWorkspaceAdmin?: boolean;
      })
    | undefined;

  if (!user?.email || !user.id) {
    redirect("/error?code=InvalidSession");
  }

  // Check if organization exists for user's domain and if user is already a member
  let orgStatus: OrganizationStatus = "none";
  if (user.hostedDomain) {
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
        orgStatus = "exists";
      } else {
        orgStatus = "not_exists";
      }
    }
  }

  const queryStep = (await searchParams).step ?? "personal";
  const initialStep = stepNames.includes(queryStep) ? queryStep : "personal";

  // If user has completed onboarding, redirect them to the app
  if (canUserMoveOn(user)) {
    return redirect(
      (await searchParams).callbackUrl ?? constServer.PROPSTO_APP_URL,
    );
  }

  return (
    <WelcomeStepper
      user={user}
      initialStep={initialStep}
      orgStatus={orgStatus}
    />
  );
}
