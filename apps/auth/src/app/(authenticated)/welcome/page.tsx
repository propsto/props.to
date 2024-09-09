import { auth } from "@/server/auth";

export default async function ProfilePage(): Promise<JSX.Element> {
  const session = await auth();
  const sessionUser = session?.user;
  return (
    <>
      <h1>{sessionUser?.name}</h1>
      <h1>{sessionUser?.email}</h1>
    </>
  );
}
