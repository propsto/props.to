import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Building2, Plus, Settings } from "lucide-react";
import {
  getAvailableManagedLinks,
  getMemberLevel,
  getMembershipByOrgSlug,
  getOrganizationTemplates,
  getUserFeedbackLinks,
} from "@propsto/data/repos";
import { constServer } from "@propsto/constants/server";
import { Badge } from "@propsto/ui/atoms/badge";
import { Button } from "@propsto/ui/atoms/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@propsto/ui/atoms/card";
import { LinkList } from "@/app/_components/link-list";
import { auth } from "@/server/auth.server";

interface OrgLandingPageProps {
  params: Promise<{ orgSlug: string }>;
}

// Member landing page: what the org offers this member and their own links in it.
// Any role may open it; non-members (including removed members) get 404.
export default async function OrgLandingPage({
  params,
}: OrgLandingPageProps): Promise<React.ReactNode> {
  const { orgSlug } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    redirect(constServer.AUTH_URL);
  }
  const userId = session.user.id;

  const membership = await getMembershipByOrgSlug(userId, orgSlug);
  if (!membership.success || !membership.data) {
    notFound();
  }
  const { organization: org, role } = membership.data;
  const isAdmin = role === "OWNER" || role === "ADMIN";

  const [linksResult, managedResult, templatesResult, levelResult] =
    await Promise.all([
      getUserFeedbackLinks(userId, { organizationId: org.id, take: 50 }),
      getAvailableManagedLinks(userId, org.id),
      getOrganizationTemplates(org.id),
      getMemberLevel(org.id, userId),
    ]);
  const links = linksResult.success ? linksResult.data.links : [];
  const managed = managedResult.success ? managedResult.data.available : [];
  const templates = templatesResult.success ? templatesResult.data : [];
  // The levels layer: no level assigned, no rubric card
  const level = levelResult.success ? levelResult.data : null;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Building2 className="h-8 w-8" />
          <div>
            <h1 className="text-2xl font-semibold">{org.name}</h1>
            <Badge variant="secondary">{role.toLowerCase()}</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          {isAdmin ? (
            <Button asChild variant="outline">
              <Link href={`/org/${orgSlug}/admin`}>
                <Settings className="mr-2 size-4" />
                Admin
              </Link>
            </Button>
          ) : null}
          <Button asChild>
            <Link href="/links/new">
              <Plus className="mr-2 size-4" />
              Create Link
            </Link>
          </Button>
        </div>
      </div>

      {level ? (
        <Card>
          <CardHeader>
            <CardTitle>Your level: {level.name}</CardTitle>
            {level.summary ? (
              <CardDescription>{level.summary}</CardDescription>
            ) : null}
          </CardHeader>
          {level.rubric.length > 0 ? (
            <CardContent>
              <dl className="space-y-3">
                {level.rubric.map((section, index) => (
                  <div key={index}>
                    <dt className="font-medium">{section.title}</dt>
                    <dd className="whitespace-pre-line text-sm text-muted-foreground">
                      {section.body}
                    </dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          ) : null}
        </Card>
      ) : null}

      <section>
        <h2 className="mb-4 text-lg font-medium">
          Your links in {org.name} ({links.length})
        </h2>
        {links.length > 0 ? (
          <LinkList links={links} />
        ) : (
          <p className="text-sm text-muted-foreground">
            You have no links in this organization yet.
          </p>
        )}
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Managed links</CardTitle>
          <CardDescription>
            Links your organization set up for you to adopt
          </CardDescription>
        </CardHeader>
        <CardContent>
          {managed.length > 0 ? (
            <ul className="space-y-2">
              {managed.map(link => (
                <li
                  key={link.id}
                  className="flex items-center justify-between gap-2"
                >
                  <span className="font-medium">{link.name}</span>
                  <Button asChild size="sm" variant="outline">
                    <Link href="/links">Adopt</Link>
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              Nothing to adopt right now.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Organization templates</CardTitle>
          <CardDescription>
            Available when you create a link for {org.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {templates.length > 0 ? (
            <ul className="space-y-1">
              {templates.map(template => (
                <li key={template.id}>{template.name}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              This organization has no templates yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
