import { redirect } from "next/navigation";
import { getConversationsForUser } from "@propsto/data/repos";
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
import {
  redactConversation,
  type ConversationAccess,
} from "@/server/conversation-access";
import {
  STAGE_LABELS,
  STATUS_LABELS,
  personName,
} from "@/lib/conversation-labels";

// What the subject may see: shared fields, never the internal notes
const SUBJECT_ACCESS: ConversationAccess = {
  isSubject: true,
  canRead: true,
  canReadInternal: false,
  canWrite: false,
  canCreateFinal: false,
};

// The conversations a member is the subject of, across their organizations
export default async function ConversationsPage(): Promise<React.ReactNode> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(constServer.AUTH_URL);
  }

  const result = await getConversationsForUser(session.user.id);
  const conversations = (result.data ?? []).flatMap(conversation => {
    const redacted = redactConversation(conversation, SUBJECT_ACCESS);
    return redacted ? [redacted] : [];
  });

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Conversations</h1>
        <p className="text-sm text-muted-foreground">
          Conversations your leads opened about your work: what was observed,
          the change expected, and when it is reviewed.
        </p>
      </div>

      {conversations.length === 0 ? (
        <p className="text-sm text-muted-foreground">No conversations.</p>
      ) : null}

      {conversations.map(conversation => (
        <Card key={conversation.id} data-testid="conversation">
          <CardHeader>
            <CardTitle className="flex flex-wrap items-center gap-2">
              <span>{conversation.organization.name}</span>
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
            </CardTitle>
            <CardDescription>
              Opened {conversation.createdAt.toLocaleDateString()}
              {conversation.openedBy
                ? ` by ${personName(conversation.openedBy)}`
                : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
