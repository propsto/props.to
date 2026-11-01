import { notFound, redirect } from "next/navigation";
import type { ConversationStage } from "@prisma/client";
import {
  getAttachableFeedback,
  getConversationsForSubject,
  getMembershipByOrgSlug,
  getOrgMemberBySlug,
  getOrgValues,
} from "@propsto/data/repos";
import { constServer } from "@propsto/constants/server";
import { Badge } from "@propsto/ui/atoms/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@propsto/ui/atoms/card";
import { auth } from "@/server/auth.server";
import { getConversationAccess } from "@/server/conversation-access";
import {
  STAGES,
  STAGE_LABELS,
  STATUS_LABELS,
  personName,
} from "@/lib/conversation-labels";
import {
  AddStepDialog,
  AttachEvidenceForm,
  OpenConversationDialog,
  ResolveButton,
} from "./conversation-controls";

interface MemberConversationsPageProps {
  params: Promise<{ orgSlug: string; memberSlug: string }>;
}

// Lead and admin view of the conversations about one member. The subject
// reads their own under /conversations; everyone else gets 404.
export default async function MemberConversationsPage({
  params,
}: MemberConversationsPageProps): Promise<React.ReactNode> {
  const { orgSlug, memberSlug } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    redirect(constServer.AUTH_URL);
  }
  const viewerId = session.user.id;

  const membership = await getMembershipByOrgSlug(viewerId, orgSlug);
  if (!membership.success || !membership.data) {
    notFound();
  }
  const org = membership.data.organization;
  const member = await getOrgMemberBySlug(org.id, memberSlug);
  if (!member.success || !member.data) {
    notFound();
  }
  const subject = member.data.user;
  const access = await getConversationAccess(viewerId, org.id, subject.id);
  if (!access.canWrite) {
    notFound();
  }

  const [conversationsResult, valuesResult, attachableResult] =
    await Promise.all([
      getConversationsForSubject(org.id, subject.id),
      getOrgValues(org.id),
      getAttachableFeedback(org.id, subject.id),
    ]);
  const conversations = conversationsResult.data ?? [];
  const values = (valuesResult.data ?? []).map(v => ({
    id: v.id,
    name: v.name,
  }));
  const attachable = (attachableResult.data ?? []).map(f => ({
    id: f.id.toString(),
    label: `${f.template.name} · ${f.createdAt.toLocaleDateString()}`,
  }));
  // Admins may record the final step; leads stop at the second
  const allowedStages = STAGES.filter(
    stage => stage !== "FINAL" || access.canCreateFinal,
  );
  const stagesFrom = (reached: ConversationStage[]): ConversationStage[] => {
    const highest = Math.max(-1, ...reached.map(s => STAGES.indexOf(s)));
    return allowedStages.filter(stage => STAGES.indexOf(stage) >= highest);
  };
  const subjectName = personName(subject);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">
            Conversations about {subjectName}
          </h1>
          <p className="text-sm text-muted-foreground">
            {org.name}. {subject.firstName ?? subjectName} reads every step
            except the internal notes.
          </p>
        </div>
        <OpenConversationDialog
          orgSlug={orgSlug}
          memberSlug={memberSlug}
          values={values}
          stages={allowedStages}
        />
      </div>

      {conversations.length === 0 ? (
        <p className="text-sm text-muted-foreground">No conversations yet.</p>
      ) : null}

      {conversations.map(conversation => {
        const nextStages = stagesFrom(conversation.steps.map(s => s.stage));
        return (
          <Card key={conversation.id} data-testid="conversation">
            <CardHeader>
              <CardTitle className="flex flex-wrap items-center gap-2">
                <Badge
                  variant={
                    conversation.status === "OPEN" ? "default" : "secondary"
                  }
                >
                  {STATUS_LABELS[conversation.status]}
                </Badge>
                {conversation.value ? (
                  <Badge variant="outline">{conversation.value.name}</Badge>
                ) : null}
                {conversation.levelNameSnapshot ? (
                  <Badge variant="outline">
                    Level: {conversation.levelNameSnapshot}
                  </Badge>
                ) : null}
              </CardTitle>
              <CardDescription>
                Opened {conversation.createdAt.toLocaleDateString()}
                {conversation.openedBy
                  ? ` by ${personName(conversation.openedBy)}`
                  : ""}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="space-y-4">
                {conversation.steps.map(step => (
                  <li key={step.id} className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <Badge variant="secondary">
                        {STAGE_LABELS[step.stage]}
                      </Badge>
                      <span className="text-muted-foreground">
                        {step.createdAt.toLocaleDateString()}
                        {step.owner ? ` · ${personName(step.owner)}` : ""}
                      </span>
                    </div>
                    <p className="whitespace-pre-line">{step.sharedNote}</p>
                    {step.internalNote ? (
                      <p className="whitespace-pre-line rounded-md bg-muted p-2 text-sm">
                        <span className="font-medium">Internal note: </span>
                        {step.internalNote}
                      </p>
                    ) : null}
                    {step.reviewAt ? (
                      <p className="text-sm text-muted-foreground">
                        Review date:{" "}
                        {step.reviewAt.toLocaleDateString(undefined, {
                          timeZone: "UTC",
                        })}
                      </p>
                    ) : null}
                    {step.consequence ? (
                      <p className="text-sm text-muted-foreground">
                        If nothing changes: {step.consequence}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ol>

              {conversation.evidence.length > 0 ? (
                <div>
                  <h3 className="text-sm font-medium">Evidence</h3>
                  <ul className="text-sm text-muted-foreground">
                    {conversation.evidence.map(feedback => (
                      <li key={feedback.id.toString()}>
                        {feedback.template.name} ·{" "}
                        {feedback.createdAt.toLocaleDateString()}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {conversation.status === "OPEN" ? (
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  {nextStages.length > 0 ? (
                    <AddStepDialog
                      orgSlug={orgSlug}
                      memberSlug={memberSlug}
                      conversationId={conversation.id}
                      stages={nextStages}
                    />
                  ) : null}
                  {attachable.length > 0 ? (
                    <AttachEvidenceForm
                      orgSlug={orgSlug}
                      memberSlug={memberSlug}
                      conversationId={conversation.id}
                      options={attachable}
                    />
                  ) : null}
                  <ResolveButton
                    orgSlug={orgSlug}
                    memberSlug={memberSlug}
                    conversationId={conversation.id}
                  />
                </div>
              ) : null}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
