import { auth } from "@/server/auth.server";
import {
  getOrganizationBySlug,
  getOrganizationManagedLinks,
  getOrganizationTemplates,
} from "@propsto/data/repos";
import { notFound } from "next/navigation";
import { Button } from "@propsto/ui/atoms/button";
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
import { LinkIcon, Plus, Users, BarChart3 } from "lucide-react";
import { CreateManagedLinkDialog } from "./create-managed-link-dialog";

interface ManagedLinksPageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function OrgAdminManagedLinks({
  params,
}: ManagedLinksPageProps): Promise<React.ReactNode> {
  const { orgSlug } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    return notFound();
  }

  // Get organization
  const orgResult = await getOrganizationBySlug(orgSlug);
  if (!orgResult.success || !orgResult.data) {
    return notFound();
  }
  const org = orgResult.data;

  // Get managed links and templates
  const [managedLinksResult, templatesResult] = await Promise.all([
    getOrganizationManagedLinks(org.id, { take: 50 }),
    getOrganizationTemplates(org.id),
  ]);

  const managedLinks = managedLinksResult.success
    ? managedLinksResult.data.links
    : [];
  const templates = templatesResult.success ? templatesResult.data : [];

  // Calculate stats
  const totalAdoptions = managedLinks.reduce(
    (sum, l) => sum + l._count.adoptedLinks,
    0,
  );
  const totalResponses = managedLinks.reduce(
    (sum, l) => sum + l._count.feedbacks,
    0,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Managed Links</h2>
          <p className="text-sm text-muted-foreground">
            Create org-level feedback links that employees can adopt
          </p>
        </div>
        {templates.length > 0 && (
          <CreateManagedLinkDialog
            organizationId={org.id}
            orgSlug={orgSlug}
            templates={templates}
            userId={session.user.id}
          />
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Managed Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{managedLinks.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Adoptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="size-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{totalAdoptions}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Responses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <BarChart3 className="size-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{totalResponses}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Managed Links Table */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Managed Links</CardTitle>
          <CardDescription>
            Links created for members to adopt. Employees get their own copy
            while you track adoption and responses across the org.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {templates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <LinkIcon className="size-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No templates available</p>
              <p className="text-sm text-muted-foreground">
                Create a template first before creating managed links
              </p>
            </div>
          ) : managedLinks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <LinkIcon className="size-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No managed links yet</p>
              <p className="text-sm text-muted-foreground">
                Create a managed link for your team to adopt
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Template</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Adoptions</TableHead>
                  <TableHead>Responses</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {managedLinks.map(link => (
                  <TableRow key={link.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{link.name}</p>
                        <p className="text-sm text-muted-foreground">
                          /{link.slug}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{link.template.name}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={link.isActive ? "default" : "secondary"}>
                        {link.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="size-3 text-muted-foreground" />
                        {link._count.adoptedLinks}
                      </div>
                    </TableCell>
                    <TableCell>{link._count.feedbacks}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(link.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
