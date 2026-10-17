import { formatDistanceToNow } from "date-fns";
import {
  getFeedbackTemplate,
  getPendingModerationFeedback,
} from "@propsto/data/repos";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@propsto/ui/atoms/card";
import { requireOrgAdmin } from "@/server/require-org-admin";
import { labelAnswers } from "@/lib/template-fields";
import { ModerationButtons } from "./moderation-buttons";

function personName(
  p: {
    firstName: string | null;
    lastName: string | null;
    email: string | null;
  } | null,
): string | null {
  if (!p) return null;
  return [p.firstName, p.lastName].filter(Boolean).join(" ") || p.email;
}

export default async function OrgAdminModeration({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}): Promise<React.ReactNode> {
  const { orgSlug } = await params;
  // Page-level guard: the layout's notFound does not stop this page from rendering data.
  const { userId, org } = await requireOrgAdmin(orgSlug);

  // Feedback addressed to this admin is left for another admin to moderate
  const result = await getPendingModerationFeedback(org.id, userId);
  const pending = result.success ? result.data : [];

  const templateIds = [...new Set(pending.map(f => f.templateId))];
  const templates = await Promise.all(templateIds.map(getFeedbackTemplate));
  const fieldsByTemplate = new Map(
    templateIds.map((id, i) => [id, templates[i]?.data?.fields ?? []]),
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Moderation</h2>
        <p className="text-sm text-muted-foreground">
          Feedback stays hidden from its recipient until approved here. Feedback
          addressed to you is moderated by another admin.
        </p>
      </div>

      {pending.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No feedback waiting for moderation
          </CardContent>
        </Card>
      ) : (
        pending.map(feedback => {
          const isAnonymous = feedback.visibility === "ANONYMOUS";
          const from = isAnonymous
            ? "Anonymous"
            : (personName(feedback.submitter) ??
              feedback.submitterName ??
              feedback.submitterEmail ??
              "Unknown sender");
          const answers = labelAnswers(
            fieldsByTemplate.get(feedback.templateId) ?? [],
            (feedback.fieldsData as Record<string, unknown> | null) ?? {},
          );
          return (
            <Card key={feedback.id.toString()} data-testid="pending-feedback">
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-base">
                    To {personName(feedback.user)}
                  </CardTitle>
                  <CardDescription>
                    From {from}
                    {feedback.link ? ` · ${feedback.link.name}` : ""} ·{" "}
                    {formatDistanceToNow(feedback.createdAt, {
                      addSuffix: true,
                    })}
                  </CardDescription>
                </div>
                <ModerationButtons
                  orgSlug={orgSlug}
                  feedbackId={feedback.id.toString()}
                />
              </CardHeader>
              <CardContent className="space-y-2">
                {answers.map(a => (
                  <div key={a.key}>
                    <p className="text-sm font-medium">{a.label}</p>
                    <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                      {String(a.value)}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
