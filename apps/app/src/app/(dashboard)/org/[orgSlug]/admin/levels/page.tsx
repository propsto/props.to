import { requireOrgAdmin } from "@/server/require-org-admin";
import { getOrgLevels } from "@propsto/data/repos";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@propsto/ui/atoms/card";
import { Badge } from "@propsto/ui/atoms/badge";
import { LevelList } from "./level-list";
import { LevelDialog } from "./level-dialog";

interface LevelsPageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function OrgAdminLevels({
  params,
}: LevelsPageProps): Promise<React.ReactNode> {
  const { orgSlug } = await params;
  // Page-level guard: the layout's notFound does not stop this page from rendering data.
  const { org } = await requireOrgAdmin(orgSlug);

  const levelsResult = await getOrgLevels(org.id);
  const levels = levelsResult.success
    ? levelsResult.data.map(l => ({
        id: l.id,
        name: l.name,
        summary: l.summary,
        memberCount: l._count.members,
      }))
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Levels</h2>
          <p className="text-sm text-muted-foreground">
            Levels members can be assigned to
          </p>
        </div>
        <LevelDialog orgSlug={orgSlug} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Organization Levels
            <Badge variant="secondary">{levels.length}</Badge>
          </CardTitle>
          <CardDescription>
            Shown in this order, junior to senior. Assign a member&apos;s level
            on the Members page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {levels.length > 0 ? (
            <LevelList levels={levels} orgSlug={orgSlug} />
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No levels yet. Create one to get started.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
