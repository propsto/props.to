import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, User, Building2, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@propsto/ui/atoms/card";
import { Badge } from "@propsto/ui/atoms/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@propsto/ui/atoms/avatar";
import type { FeedbackWithRelations } from "@propsto/data/repos/feedback";

interface FeedbackListProps {
  feedbacks: FeedbackWithRelations[];
  showRecipient?: boolean;
}

const feedbackTypeBadgeVariant: Record<
  string,
  "default" | "secondary" | "outline"
> = {
  RECOGNITION: "default",
  THREE_SIXTY: "secondary",
  PEER_REVIEW: "secondary",
  MANAGER_FEEDBACK: "outline",
  REPORT_FEEDBACK: "outline",
  SELF_ASSESSMENT: "outline",
  ANONYMOUS: "secondary",
};

const feedbackTypeLabel: Record<string, string> = {
  RECOGNITION: "Recognition",
  THREE_SIXTY: "360°",
  PEER_REVIEW: "Peer Review",
  MANAGER_FEEDBACK: "Manager",
  REPORT_FEEDBACK: "Report",
  SELF_ASSESSMENT: "Self",
  ANONYMOUS: "Anonymous",
};

export function FeedbackList({
  feedbacks,
  showRecipient = false,
}: FeedbackListProps): React.JSX.Element {
  if (feedbacks.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No feedback to display
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {feedbacks.map(feedback => (
        <FeedbackCard
          key={feedback.id.toString()}
          feedback={feedback}
          showRecipient={showRecipient}
        />
      ))}
    </div>
  );
}

function FeedbackCard({
  feedback,
  showRecipient,
}: {
  feedback: FeedbackWithRelations;
  showRecipient: boolean;
}): React.JSX.Element {
  const isAnonymous =
    feedback.visibility === "ANONYMOUS" || !feedback.submitter;
  const submitterName = isAnonymous
    ? "Anonymous"
    : feedback.submitter
      ? `${feedback.submitter.firstName || ""} ${feedback.submitter.lastName || ""}`.trim() ||
        feedback.submitterEmail ||
        "Someone"
      : feedback.submitterName || feedback.submitterEmail || "Someone";

  const submitterInitials = isAnonymous
    ? "?"
    : submitterName
        .split(" ")
        .map(n => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

  return (
    <Link href={`/feedback/${feedback.id}`}>
      <Card className="transition-colors hover:bg-muted/50">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="size-10">
                {!isAnonymous && feedback.submitter?.image ? (
                  <AvatarImage
                    src={feedback.submitter.image}
                    alt={submitterName}
                  />
                ) : null}
                <AvatarFallback>{submitterInitials}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-base font-medium">
                  {submitterName}
                </CardTitle>
                <CardDescription className="text-sm">
                  {formatDistanceToNow(new Date(feedback.createdAt), {
                    addSuffix: true,
                  })}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  feedbackTypeBadgeVariant[feedback.feedbackType] || "secondary"
                }
              >
                {feedbackTypeLabel[feedback.feedbackType] ||
                  feedback.feedbackType}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            {/* Context badges */}
            <div className="flex flex-wrap gap-2">
              {feedback.template && (
                <Badge variant="outline" className="text-xs">
                  <MessageSquare className="mr-1 size-3" />
                  {feedback.template.name}
                </Badge>
              )}
              {feedback.organization && (
                <Badge variant="outline" className="text-xs">
                  <Building2 className="mr-1 size-3" />
                  {feedback.organizationNameSnapshot ||
                    feedback.organization.name}
                </Badge>
              )}
              {feedback.group && (
                <Badge variant="outline" className="text-xs">
                  <Users className="mr-1 size-3" />
                  {feedback.groupNameSnapshot || feedback.group.name}
                </Badge>
              )}
              {showRecipient && feedback.user && (
                <Badge variant="outline" className="text-xs">
                  <User className="mr-1 size-3" />
                  To: {feedback.user.firstName || feedback.user.email}
                </Badge>
              )}
            </div>

            {/* Preview of feedback content */}
            {feedback.fieldsData && (
              <FeedbackPreview
                data={feedback.fieldsData as Record<string, unknown>}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function FeedbackPreview({
  data,
}: {
  data: Record<string, unknown>;
}): React.JSX.Element | null {
  // Try to extract a text preview from the feedback data
  const textFields = Object.entries(data).filter(
    ([, value]) => typeof value === "string" && value.length > 0,
  );

  if (textFields.length === 0) {
    return null;
  }

  // Get the first text field as preview
  const [, firstValue] = textFields[0];
  const preview = String(firstValue).slice(0, 150);

  return (
    <p className="text-sm text-muted-foreground line-clamp-2">
      {preview}
      {String(firstValue).length > 150 && "..."}
    </p>
  );
}
