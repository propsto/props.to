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

  const levelsResult = await getOrgLevels(org.id, { includeArchived: true });
  const allLevels = levelsResult.success
    ? levelsResult.data.map(l => ({
        id: l.id,
        name: l.name,
        summary: l.summary,
        memberCount: l._count.members,
        archived: l.archivedAt !== null,
      }))
    : [];
  const levels = allLevels.filter(l => !l.archived);
  const archivedLevels = allLevels.filter(l => l.archived);

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
            on the Members page. Archived levels can no longer be assigned;
            members already on one keep it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {levels.length > 0 ? (
            <LevelList levels={levels} orgSlug={orgSlug} />
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              {archivedLevels.length > 0
                ? "No active levels. Create or restore one to assign it."
                : "No levels yet. Create one to get started."}
            </p>
          )}
          {archivedLevels.length > 0 ? (
            <details className="mt-6 border-t pt-4">
              <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
                Archived ({archivedLevels.length})
              </summary>
              <div className="pt-4">
                <LevelList levels={archivedLevels} orgSlug={orgSlug} archived />
              </div>
            </details>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
