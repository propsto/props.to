import { requireOrgAdmin } from "@/server/require-org-admin";
import {
  getOrganizationBySlugWithMembers,
  getOrgLevels,
  listPendingOrganizationInvites,
} from "@propsto/data/repos";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@propsto/ui/atoms/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@propsto/ui/atoms/table";
import { Badge } from "@propsto/ui/atoms/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@propsto/ui/atoms/avatar";
import { Separator } from "@propsto/ui/atoms/separator";
import { InviteDialog } from "./invite-dialog";
import { PendingInvites } from "./pending-invites";
import { MemberActions } from "./member-actions";
import { MemberLevelSelect } from "./member-level-select";

function memberName(user: {
  firstName: string | null;
  lastName: string | null;
  email: string;
}): string {
  return `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.email;
}

interface MembersPageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function OrgAdminMembers({
  params,
}: MembersPageProps): Promise<React.ReactNode> {
  const { orgSlug } = await params;
  const {
    org: adminOrg,
    userId: actorId,
    role: actorRole,
  } = await requireOrgAdmin(orgSlug);

  const [orgResult, invitesResult, levelsResult] = await Promise.all([
    getOrganizationBySlugWithMembers(orgSlug),
    listPendingOrganizationInvites(adminOrg.id),
    getOrgLevels(adminOrg.id),
  ]);
  if (!orgResult.success || !orgResult.data) {
    return notFound();
  }
  const org = orgResult.data;

  const pendingInvites = (invitesResult.data ?? []).map(inv => ({
    id: inv.id,
    email: inv.email,
    role: inv.role,
    expiresAt: inv.expiresAt,
    createdAt: inv.createdAt,
    invitedBy: inv.invitedBy,
  }));

  // The level column shows only once the org has levels
  const levels = (levelsResult.data ?? []).map(l => ({
    id: l.id,
    name: l.name,
  }));

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "OWNER":
        return "default";
      case "ADMIN":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold">Members</h2>
          <p className="text-sm text-muted-foreground">
            Manage organization members and their roles
          </p>
        </div>
        <InviteDialog orgSlug={orgSlug} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Members</CardTitle>
          <CardDescription>
            {org.members.length} member{org.members.length !== 1 ? "s" : ""} in
            this organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Role</TableHead>
                {levels.length > 0 ? <TableHead>Level</TableHead> : null}
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {org.members.map(member => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.user.image ?? undefined} />
                        <AvatarFallback>
                          {member.user.firstName?.[0] ??
                            member.user.email?.[0] ??
                            "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {member.user.firstName} {member.user.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {member.user.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-sm">@{member.user.slug.slug}</code>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(member.role)}>
                      {member.role}
                    </Badge>
                  </TableCell>
                  {levels.length > 0 ? (
                    <TableCell>
                      <MemberLevelSelect
                        orgSlug={orgSlug}
                        userId={member.userId}
                        name={memberName(member.user)}
                        levelId={member.levelId}
                        levels={levels}
                      />
                    </TableCell>
                  ) : null}
                  <TableCell className="text-muted-foreground">
                    {new Date(member.joinedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {member.userId !== actorId &&
                    (actorRole === "OWNER" || member.role !== "OWNER") ? (
                      <MemberActions
                        orgSlug={orgSlug}
                        userId={member.userId}
                        name={memberName(member.user)}
                        role={member.role}
                        canGrantOwner={actorRole === "OWNER"}
                      />
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {pendingInvites.length > 0 ? (
            <>
              <Separator className="my-6" />
              <PendingInvites orgSlug={orgSlug} invites={pendingInvites} />
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
