import Link from "next/link";
import { auth } from "@/server/auth.server";
import {
  getOrganizationBySlug,
  getOrganizationTemplates,
  getDefaultTemplates,
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
import { Plus, FileText, Copy } from "lucide-react";
import { AddDefaultTemplateButton } from "./add-default-template-button";

interface TemplatesPageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function OrgAdminTemplates({
  params,
}: TemplatesPageProps): Promise<React.ReactNode> {
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

  // Get organization templates and default templates
  const [orgTemplatesResult, defaultTemplatesResult] = await Promise.all([
    getOrganizationTemplates(org.id),
    getDefaultTemplates(),
  ]);

  const orgTemplates = orgTemplatesResult.success
    ? orgTemplatesResult.data
    : [];
  const defaultTemplates = defaultTemplatesResult.success
    ? defaultTemplatesResult.data
    : [];

  // Filter out default templates already added to org
  const orgTemplateIds = new Set(orgTemplates.map((t) => t.id));
  const availableDefaults = defaultTemplates.filter(
    (t) => !orgTemplateIds.has(t.id)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Organization Templates</h2>
          <p className="text-sm text-muted-foreground">
            Manage feedback templates available to organization members
          </p>
        </div>
        <Button asChild>
          <Link href={`/org/${orgSlug}/admin/templates/new`}>
            <Plus className="mr-2 size-4" />
            Create Template
          </Link>
        </Button>
      </div>

      {/* Organization Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Active Templates</CardTitle>
          <CardDescription>
            Templates available to members when creating feedback links
          </CardDescription>
        </CardHeader>
        <CardContent>
          {orgTemplates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No templates yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Create a custom template or add from defaults below
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Fields</TableHead>
                  <TableHead>Usage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orgTemplates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{template.name}</p>
                        {template.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {template.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{template.feedbackType}</Badge>
                    </TableCell>
                    <TableCell>
                      {template.category?.name ?? (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>{template.fields.length} fields</TableCell>
                    <TableCell>
                      <span className="text-muted-foreground">
                        {template._count.links} links
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Available Default Templates */}
      {availableDefaults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Default Templates</CardTitle>
            <CardDescription>
              System templates you can add to your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {availableDefaults.map((template) => (
                <Card key={template.id} className="relative">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">
                        {template.name}
                      </CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {template.feedbackType}
                      </Badge>
                    </div>
                    {template.description && (
                      <CardDescription className="line-clamp-2">
                        {template.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {template.fields.length} fields
                      </span>
                      <AddDefaultTemplateButton
                        templateId={template.id}
                        organizationId={org.id}
                        orgSlug={orgSlug}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
