import { requireOrgAdmin } from "@/server/require-org-admin";
import {
  getDefaultTemplates,
  getOrganizationEntities,
  getOrganizationTemplates,
} from "@propsto/data/repos";
import { Card, CardContent } from "@propsto/ui/atoms/card";
import { EntityDialog } from "./entity-dialog";
import { EntityList } from "./entity-list";

export default async function OrgAdminEntities({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}): Promise<React.ReactNode> {
  const { orgSlug } = await params;
  // Page-level guard: the layout's notFound does not stop this page from rendering data.
  const { org } = await requireOrgAdmin(orgSlug);

  // A link may use the org's templates or a system default (assertTemplateUsable)
  const [entitiesResult, orgTemplates, defaultTemplates] = await Promise.all([
    getOrganizationEntities(org.id),
    getOrganizationTemplates(org.id),
    getDefaultTemplates(),
  ]);
  const entities = entitiesResult.success ? entitiesResult.data : [];
  const templates = [
    ...(orgTemplates.data ?? []),
    ...(defaultTemplates.data ?? []),
  ]
    .filter((t, i, all) => all.findIndex(o => o.id === t.id) === i)
    .map(t => ({ id: t.id, name: t.name }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Entities</h2>
          <p className="text-sm text-muted-foreground">
            Collect feedback on products, events or services. It belongs to the
            organization, never to a person&apos;s feedback.
          </p>
        </div>
        <EntityDialog orgSlug={orgSlug} />
      </div>

      {entities.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No entities yet. Create one to start collecting feedback on it.
          </CardContent>
        </Card>
      ) : (
        <EntityList
          orgSlug={orgSlug}
          templates={templates}
          entities={entities.map(e => ({
            id: e.id,
            name: e.name,
            slug: e.slug.slug,
            description: e.description,
            feedbackCount: e._count.feedbacks,
            links: e.feedbackLinks.map(l => ({
              id: l.id,
              name: l.name,
              slug: l.slug,
              template: l.template.name,
            })),
          }))}
        />
      )}
    </div>
  );
}
