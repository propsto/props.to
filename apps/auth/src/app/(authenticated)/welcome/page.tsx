import { type JSX } from "react";
import { constServer } from "@propsto/constants/server";
import { redirect } from "next/navigation";
import { getUserByEmail } from "@propsto/data/repos";
import { auth } from "@/server/auth";
import { WelcomeStepper } from "@components/welcome-stepper";

export default async function WelcomePage(): Promise<JSX.Element> {
  const session = await auth();
  if (!session?.user?.email) redirect("/");
  const { success, data } = await getUserByEmail(session.user.email, {
    id: true,
    dateOfBirth: true,
    firstName: true,
    lastName: true,
    email: true,
    image: true,
    username: true,
  });
  if (!success || !data) return redirect("/error?code=InvalidSession");
  if (
    data.firstName &&
    data.lastName &&
    data.image &&
    data.dateOfBirth &&
    data.username.length < 41
  )
    return redirect(constServer.PROPSTO_APP_URL);
  return <WelcomeStepper user={data} />;
}
