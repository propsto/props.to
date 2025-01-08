import { redirect } from "next/navigation";
import { type User } from "next-auth";
import { canUserMoveOn } from "@/lib/post-auth-check";
import { auth } from "@/server/auth.server";
import { WelcomeStepper } from "@components/welcome-stepper";
import { stepNames } from "@components/welcome-stepper/steps";

export default async function WelcomePage({
  searchParams,
}: Readonly<{
  searchParams: Promise<Record<string, string | undefined>>;
}>): Promise<React.ReactElement> {
  const queryStep = (await searchParams).step ?? "personal";
  const initialStep = stepNames.includes(queryStep) ? queryStep : "personal";
  const session = await auth();
  const user = session?.user as
    | (User & { id: string; email: string })
    | undefined;
  if (!user?.email || !user.id) {
    redirect("/error?code=InvalidSession");
  }
  if (canUserMoveOn(user)) {
    return redirect(
      (await searchParams).callbackUrl ?? process.env.PROPSTO_APP_URL ?? "",
    );
  }
  return <WelcomeStepper user={user} initialStep={initialStep} />;
}
