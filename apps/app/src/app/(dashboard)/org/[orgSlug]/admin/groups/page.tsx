import { auth } from "@/server/auth.server";
import {
  getOrganizationBySlugWithMembers,
  getOrganizationGroups,
} from "@propsto/data/repos";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@propsto/ui/atoms/card";
import { GroupList } from "./group-list";
import { CreateGroupDialog } from "./create-group-dialog";

interface GroupsPageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function OrgAdminGroups({
  params,
}: GroupsPageProps): Promise<React.ReactNode> {
  const { orgSlug } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    return notFound();
  }

  // Get organization with members (for the member picker)
  const orgResult = await getOrganizationBySlugWithMembers(orgSlug);
  if (!orgResult.success || !orgResult.data) {
    return notFound();
  }
  const org = orgResult.data;

  // Get all groups for this organization
  const groupsResult = await getOrganizationGroups(org.id);
  const groups = groupsResult.success ? groupsResult.data?.groups ?? [] : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Groups</h2>
          <p className="text-sm text-muted-foreground">
            Create and manage groups within your organization
          </p>
        </div>
        <CreateGroupDialog
          organizationId={org.id}
          members={org.members.map(m => ({
            id: m.user.id,
            firstName: m.user.firstName,
            lastName: m.user.lastName,
            email: m.user.email,
            image: m.user.image,
          }))}
          groups={groups.map(g => ({
            id: g.id,
            name: g.name,
            parentGroupId: g.parent?.id ?? null,
          }))}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Groups</CardTitle>
          <CardDescription>
            {groups.length} group{groups.length !== 1 ? "s" : ""} in this
            organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          {groups.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No groups yet. Create your first group to organize your team.
            </p>
          ) : (
            <GroupList
              groups={groups}
              members={org.members.map(m => ({
                id: m.user.id,
                firstName: m.user.firstName,
                lastName: m.user.lastName,
                email: m.user.email,
                image: m.user.image,
              }))}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
