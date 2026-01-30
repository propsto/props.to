import { auth } from "@/server/auth.server";
import { db } from "@propsto/data";
import { getAuditLogs } from "@propsto/data/repos";
import { notFound, redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@propsto/ui/atoms/card";
import { AuditLogList } from "./audit-log-list";

interface AuditPageProps {
  params: Promise<{ orgSlug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function OrgAdminAudit({
  params,
  searchParams,
}: AuditPageProps): Promise<React.ReactNode> {
  const [{ orgSlug }, search] = await Promise.all([params, searchParams]);
  const session = await auth();

  if (!session?.user?.id) {
    return notFound();
  }

  // Verify user is admin of this org
  const membership = await db.organizationMember.findFirst({
    where: {
      userId: session.user.id,
      organization: {
        slug: {
          slug: orgSlug,
        },
      },
    },
    select: {
      role: true,
      organization: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!membership) {
    return notFound();
  }

  // Only OWNER and ADMIN can view audit logs
  if (membership.role !== "OWNER" && membership.role !== "ADMIN") {
    return redirect(`/org/${orgSlug}`);
  }

  const org = membership.organization;

  // Parse pagination
  const page = parseInt(search.page ?? "1", 10);
  const limit = 20;
  const offset = (page - 1) * limit;

  // Get audit logs
  const result = await getAuditLogs(
    { organizationId: org.id },
    { limit, offset },
  );

  const logs = result.success ? result.data?.logs ?? [] : [];
  const total = result.success ? result.data?.total ?? 0 : 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Audit Log</h2>
        <p className="text-sm text-muted-foreground">
          Track admin actions and changes in your organization
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity History</CardTitle>
          <CardDescription>
            {total} total events recorded
          </CardDescription>
        </CardHeader>
        <CardContent>
          {logs.length > 0 ? (
            <AuditLogList
              logs={logs}
              orgSlug={orgSlug}
              currentPage={page}
              totalPages={totalPages}
            />
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No audit events recorded yet. Actions will appear here as they happen.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
