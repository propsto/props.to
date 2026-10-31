import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireOrgAdmin } from "@/server/require-org-admin";
import { getOrgLevel, getOrgValues } from "@propsto/data/repos";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@propsto/ui/atoms/card";
import { RubricEditor } from "./rubric-editor";
import { ExpectationGrid } from "./expectation-grid";

interface LevelDetailPageProps {
  params: Promise<{ orgSlug: string; levelId: string }>;
}

export default async function OrgAdminLevelDetail({
  params,
}: LevelDetailPageProps): Promise<React.ReactNode> {
  const { orgSlug, levelId } = await params;
  const { org } = await requireOrgAdmin(orgSlug);

  const [levelResult, valuesResult] = await Promise.all([
    getOrgLevel(levelId, org.id),
    getOrgValues(org.id),
  ]);
  if (!levelResult.success || !levelResult.data) {
    notFound();
  }
  const level = levelResult.data;
  const values = valuesResult.success ? valuesResult.data : [];
  const expectationText = new Map(
    level.expectations.map(e => [e.valueId, e.text]),
  );

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/org/${orgSlug}/admin/levels`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Levels
        </Link>
        <h2 className="text-lg font-semibold">{level.name}</h2>
        <p className="text-sm text-muted-foreground">
          Summary, rubric and what each value looks like at this level
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rubric</CardTitle>
          <CardDescription>
            Members at this level see the summary and rubric on their
            organization page
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RubricEditor
            orgSlug={orgSlug}
            levelId={level.id}
            summary={level.summary ?? ""}
            rubric={level.rubric}
          />
        </CardContent>
      </Card>

      {values.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Value expectations</CardTitle>
            <CardDescription>
              Shown beside the feedback form when a member ticks the value for
              someone at this level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ExpectationGrid
              orgSlug={orgSlug}
              levelId={level.id}
              values={values.map(v => ({
                id: v.id,
                name: v.name,
                text: expectationText.get(v.id) ?? "",
              }))}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
