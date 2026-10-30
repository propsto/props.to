import { requireOrgAdmin } from "@/server/require-org-admin";
import { getOrgValues } from "@propsto/data/repos";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@propsto/ui/atoms/card";
import { Badge } from "@propsto/ui/atoms/badge";
import { ValueList } from "./value-list";
import { ValueDialog } from "./value-dialog";

interface ValuesPageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function OrgAdminValues({
  params,
}: ValuesPageProps): Promise<React.ReactNode> {
  const { orgSlug } = await params;
  // Page-level guard: the layout's notFound does not stop this page from rendering data.
  const { org } = await requireOrgAdmin(orgSlug);

  const valuesResult = await getOrgValues(org.id);
  const values = valuesResult.success
    ? valuesResult.data.map(v => ({
        id: v.id,
        name: v.name,
        description: v.description,
        feedbackCount: v._count.feedbacks,
      }))
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Values</h2>
          <p className="text-sm text-muted-foreground">
            Values people can tag feedback with
          </p>
        </div>
        <ValueDialog orgSlug={orgSlug} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Organization Values
            <Badge variant="secondary">{values.length}</Badge>
          </CardTitle>
          <CardDescription>
            Shown in this order on feedback forms. With no values, forms show no
            value picker.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {values.length > 0 ? (
            <ValueList values={values} orgSlug={orgSlug} />
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No values yet. Create one to get started.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
