import { auth } from "@/server/auth.server";
import {
  getOrganizationBySlug,
  getOrganizationMemberFeedbackLinks,
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
import { LinkIcon, EyeOff } from "lucide-react";

interface LinksPageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function OrgAdminLinks({
  params,
}: LinksPageProps): Promise<React.ReactNode> {
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

  // Get all feedback links from org members
  const linksResult = await getOrganizationMemberFeedbackLinks(org.id, {
    take: 100,
  });
  const links = linksResult.success ? linksResult.data.links : [];
  const totalLinks = linksResult.success ? linksResult.data.total : 0;

  // Calculate stats
  const activeLinks = links.filter(l => l.isActive).length;
  const totalResponses = links.reduce((sum, l) => sum + l._count.feedbacks, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Feedback Links</h2>
        <p className="text-sm text-muted-foreground">
          View feedback links created by organization members
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLinks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeLinks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Responses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalResponses}</div>
          </CardContent>
        </Card>
      </div>

      {/* Links Table */}
      <Card>
        <CardHeader>
          <CardTitle>Member Feedback Links</CardTitle>
          <CardDescription>
            All feedback links created by members of your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          {links.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <LinkIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No feedback links yet</p>
              <p className="text-sm text-muted-foreground">
                Members haven&apos;t created any feedback links
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Link Name</TableHead>
                  <TableHead>Template</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Responses</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {links.map(link => (
                  <TableRow key={link.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={link.user.image ?? undefined} />
                          <AvatarFallback>
                            {link.user.firstName?.[0] ?? "?"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">
                          {link.user.firstName} {link.user.lastName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{link.name}</span>
                        {link.isHidden && (
                          <EyeOff className="h-3 w-3 text-muted-foreground" />
                        )}
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
