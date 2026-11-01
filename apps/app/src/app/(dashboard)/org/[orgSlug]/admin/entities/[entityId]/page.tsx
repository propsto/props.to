import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
  getEntity,
  getEntityFeedback,
  getFeedbackTemplate,
} from "@propsto/data/repos";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@propsto/ui/atoms/card";
import { Badge } from "@propsto/ui/atoms/badge";
import { ArrowLeft } from "lucide-react";
import { requireOrgAdmin } from "@/server/require-org-admin";
import { labelAnswers } from "@/lib/template-fields";

// An entity's approved feedback. Pending feedback is in the moderation queue.
export default async function OrgAdminEntityFeedback({
  params,
}: {
  params: Promise<{ orgSlug: string; entityId: string }>;
}): Promise<React.ReactNode> {
  const { orgSlug, entityId } = await params;
  // Page-level guard: the layout's notFound does not stop this page from rendering data.
  const { org } = await requireOrgAdmin(orgSlug);

  // Both reads are scoped to the admin's org, so another org's id is a 404
  const [entityResult, feedbackResult] = await Promise.all([
    getEntity(entityId, org.id),
    getEntityFeedback(entityId, org.id),
  ]);
  if (!entityResult.data) notFound();
  const entity = entityResult.data;
  const feedbacks = feedbackResult.data ?? [];

  const templateIds = [...new Set(feedbacks.map(f => f.templateId))];
  const templates = await Promise.all(templateIds.map(getFeedbackTemplate));
  const fieldsByTemplate = new Map(
    templateIds.map((id, i) => [id, templates[i]?.data?.fields ?? []]),
  );

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/org/${orgSlug}/admin/entities`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Entities
        </Link>
        <h2 className="text-lg font-semibold mt-2">{entity.name}</h2>
        <p className="text-sm text-muted-foreground">
          Approved feedback. New feedback from non-members waits in moderation
          first.
        </p>
      </div>

      {feedbacks.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No feedback yet
          </CardContent>
        </Card>
      ) : (
        feedbacks.map(feedback => {
          const from =
            feedback.visibility === "ANONYMOUS"
              ? "Anonymous"
              : [feedback.submitter?.firstName, feedback.submitter?.lastName]
                  .filter(Boolean)
                  .join(" ") ||
                feedback.submitterName ||
                "Anonymous";
          const answers = labelAnswers(
            fieldsByTemplate.get(feedback.templateId) ?? [],
            (feedback.fieldsData as Record<string, unknown> | null) ?? {},
          );
          return (
            <Card key={feedback.id.toString()} data-testid="entity-feedback">
              <CardHeader>
                <CardTitle className="text-base">From {from}</CardTitle>
                <CardDescription>
                  {feedback.link ? `${feedback.link.name} · ` : ""}
                  {formatDistanceToNow(feedback.createdAt, { addSuffix: true })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {feedback.context && (
                  <p className="text-sm">
                    <span className="font-medium">On:</span> {feedback.context}
                  </p>
                )}
                {answers.map(a => (
                  <div key={a.key}>
                    <p className="text-sm font-medium">{a.label}</p>
                    <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                      {String(a.value)}
                    </p>
                  </div>
                ))}
                {feedback.values.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {feedback.values.map(v => (
                      <Badge key={v.value.name} variant="secondary">
                        {v.value.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
