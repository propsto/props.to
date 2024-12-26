import { constServer } from "@propsto/constants/server";
import { redirect } from "next/navigation";
import { type User } from "next-auth";
import { auth } from "@/server/auth";
import { WelcomeStepper } from "@components/welcome-stepper";
import { stepNames } from "@components/welcome-stepper/steps";

export default async function WelcomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}): Promise<React.ReactElement> {
  const queryStep = (await searchParams).step ?? "personal";
  const initialStep = stepNames.includes(queryStep) ? queryStep : "personal";
  const session = await auth();
  const user = session?.user as
    | (User & { id: string; email: string })
    | undefined;
  if (!user?.email || !user.id) {
    redirect("/error?code=InvalidSession");
  }
  if (
    user.firstName &&
    user.lastName &&
    user.image &&
    user.dateOfBirth &&
    user.username &&
    user.username.length < 41
  ) {
    return redirect(constServer.PROPSTO_APP_URL);
  }
  return <WelcomeStepper user={user} initialStep={initialStep} />;
}
