import { auth } from "@/server/auth.server";
import { redirect, notFound } from "next/navigation";
import { constServer } from "@propsto/constants/server";
import {
  getMembershipByOrgSlug,
  getOrganizationTemplates,
  getOrganizationMemberFeedbackLinks,
} from "@propsto/data/repos";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@propsto/ui/atoms/card";
import {
  Building2,
  Users,
  FileText,
  LinkIcon,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@propsto/ui/atoms/button";

interface OrgDashboardProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function OrgDashboard({
  params,
}: OrgDashboardProps): Promise<React.ReactNode> {
  const { orgSlug } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    return redirect(constServer.AUTH_URL);
  }

  // Verify membership
  const membershipResult = await getMembershipByOrgSlug(
    session.user.id,
    orgSlug,
  );

  if (!membershipResult.success || !membershipResult.data) {
    return notFound();
  }

  const membership = membershipResult.data;
  const org = membership.organization;
  const orgId = org.id;
  const isAdmin = membership.role === "OWNER" || membership.role === "ADMIN";

  // Fetch org stats in parallel (use orgId from membership, no extra DB call)
  const [templatesResult, linksResult] = await Promise.all([
    getOrganizationTemplates(orgId),
    getOrganizationMemberFeedbackLinks(orgId, { take: 5 }),
  ]);

  const templateCount = templatesResult.success
    ? templatesResult.data.length
    : 0;
  const totalLinks = linksResult.success ? linksResult.data.total : 0;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building2 className="h-8 w-8" />
          <div>
            <h1 className="text-2xl font-semibold">{org.name}</h1>
            <p className="text-sm text-muted-foreground">
              {membership.role.toLowerCase()} · {session.user.email}
            </p>
          </div>
        </div>
        {isAdmin && (
          <Button asChild variant="outline">
            <Link href={`/org/${orgSlug}/admin`}>Admin Panel</Link>
          </Button>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Templates</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templateCount}</div>
            <p className="text-xs text-muted-foreground">
              Available feedback templates
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Feedback Links
            </CardTitle>
            <LinkIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLinks}</div>
            <p className="text-xs text-muted-foreground">
              Links across all members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Your Role</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {membership.role.toLowerCase()}
            </div>
            <p className="text-xs text-muted-foreground">in {org.name}</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks for your organization</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href="/links/new">
              <LinkIcon className="mr-2 h-4 w-4" />
              Create Feedback Link
            </Link>
          </Button>
          {isAdmin && (
            <>
              <Button asChild variant="outline">
                <Link href={`/org/${orgSlug}/admin/links`}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  View Org Links
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={`/org/${orgSlug}/admin/members`}>
                  <Users className="mr-2 h-4 w-4" />
                  Manage Members
                </Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
