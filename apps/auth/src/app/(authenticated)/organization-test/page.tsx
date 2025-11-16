import { redirect } from "next/navigation";
import { type User } from "next-auth";
import { db } from "@propsto/data/db";
import { auth } from "@/server/auth.server";
import { OrganizationSettingsDisplay } from "@/app/_components/organization-settings-display";

export default async function OrganizationTestPage(): Promise<React.ReactElement> {
  const session = await auth();
  const user = session?.user as
    | (User & { id: string; email: string })
    | undefined;

  if (!user?.email || !user.id) {
    redirect("/error?code=InvalidSession");
  }

  // Get user's organization
  const userWithOrg = await db.user.findUnique({
    where: { id: user.id },
    include: { organization: true },
  });

  if (!userWithOrg?.organization) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Organization Settings Test</h1>
            <p className="text-muted-foreground">
              You are not associated with any organization.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Organization Settings Test</h1>
          <p className="text-muted-foreground">
            This page shows the organization settings that were saved during the
            welcome wizard.
          </p>
        </div>

        <div className="flex justify-center">
          <OrganizationSettingsDisplay
            organizationId={userWithOrg.organization.id}
          />
        </div>
      </div>
    </div>
  );
}
