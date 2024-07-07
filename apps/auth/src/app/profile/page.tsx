import { auth } from "@/server/auth";

export default async function ProfilePage(): Promise<JSX.Element> {
  const session = await auth();
  const user = session?.user;
  return (
    <>
      <h1>{user?.name}</h1>
      <h1>{user?.email}</h1>
    </>
  );
}
