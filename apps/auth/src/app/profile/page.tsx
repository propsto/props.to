import { auth } from "@/server/auth.server";

export default async function ProfilePage(): Promise<React.ReactElement> {
  const session = await auth();
  const user = session?.user;
  return (
    <>
      <h1>{user?.name}</h1>
      <h1>{user?.email}</h1>
    </>
  );
}
