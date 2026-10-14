import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDistanceToNow, format } from "date-fns";
import {
  ArrowLeft,
  MessageSquare,
  Building2,
  Users,
  User,
  Calendar,
  Link as LinkIcon,
} from "lucide-react";
import { auth } from "@/server/auth.server";
import { getFeedback, getFeedbackTemplate } from "@propsto/data/repos";
import { labelAnswers, SCALE_MAX } from "@/lib/template-fields";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@propsto/ui/atoms/card";
import { Badge } from "@propsto/ui/atoms/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@propsto/ui/atoms/avatar";
import { Button } from "@propsto/ui/atoms/button";
import { Separator } from "@propsto/ui/atoms/separator";

const feedbackTypeLabel: Record<string, string> = {
  RECOGNITION: "Recognition",
  THREE_SIXTY: "360° Feedback",
  PEER_REVIEW: "Peer Review",
  MANAGER_FEEDBACK: "Manager Feedback",
  REPORT_FEEDBACK: "Report Feedback",
  SELF_ASSESSMENT: "Self Assessment",
  ANONYMOUS: "Anonymous Feedback",
};

export default async function FeedbackDetailPage({
  params,
}: {
  params: Promise<{ feedbackId: string }>;
}): Promise<React.ReactNode> {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const { feedbackId } = await params;
  const feedbackResult = await getFeedback(BigInt(feedbackId));

  if (!feedbackResult.success || !feedbackResult.data) {
    notFound();
  }

  const feedback = feedbackResult.data;

  // Check if user has access to this feedback
  const isRecipient = feedback.userId === session.user.id;
  const isSender = feedback.submitterId === session.user.id;
  if (!isRecipient && !isSender) {
    notFound();
  }

  // Template fields give the stored answers their labels and types
  const templateResult = await getFeedbackTemplate(feedback.templateId);
  const answers = labelAnswers(
    templateResult.data?.fields ?? [],
    (feedback.fieldsData as Record<string, unknown> | null) ?? {},
  );

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
    <div className="flex flex-col gap-6 py-6">
      <div className="flex items-center gap-4 px-4 lg:px-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/feedback">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">Feedback Detail</h1>
          <p className="text-muted-foreground">
            {feedbackTypeLabel[feedback.feedbackType] || "Feedback"}
          </p>
        </div>
      </div>

      <div className="px-4 lg:px-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Avatar className="size-12">
                    {!isAnonymous && feedback.submitter?.image ? (
                      <AvatarImage
                        src={feedback.submitter.image}
                        alt={submitterName}
                      />
                    ) : null}
                    <AvatarFallback>{submitterInitials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{submitterName}</CardTitle>
                    <CardDescription>
                      {formatDistanceToNow(new Date(feedback.createdAt), {
                        addSuffix: true,
                      })}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Separator className="mb-6" />
                <FeedbackContent answers={answers} />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="size-4 text-muted-foreground" />
                  <span>
                    {format(new Date(feedback.createdAt), "PPP 'at' p")}
                  </span>
                </div>

                {feedback.template && (
                  <div className="flex items-center gap-2 text-sm">
                    <MessageSquare className="size-4 text-muted-foreground" />
                    <span>{feedback.template.name}</span>
                  </div>
                )}

                {feedback.organization && (
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="size-4 text-muted-foreground" />
                    <span>
                      {feedback.organizationNameSnapshot ||
                        feedback.organization.name}
                    </span>
                  </div>
                )}

                {feedback.group && (
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="size-4 text-muted-foreground" />
                    <span>
                      {feedback.groupNameSnapshot || feedback.group.name}
                    </span>
                  </div>
                )}

                {feedback.link && (
                  <div className="flex items-center gap-2 text-sm">
                    <LinkIcon className="size-4 text-muted-foreground" />
                    <span>Via: {feedback.link.name}</span>
                  </div>
                )}

                {isRecipient && feedback.user && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="size-4 text-muted-foreground" />
                    <span>
                      To: {feedback.user.firstName || feedback.user.email}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Goals linking */}
            {feedback.goals && feedback.goals.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Linked Goals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {feedback.goals.map(goal => (
                      <Link
                        key={goal.id}
                        href={`/goals/${goal.id}`}
                        className="block rounded-md border p-2 text-sm hover:bg-muted"
                      >
                        {goal.title}
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FeedbackContent({
  answers,
}: {
  answers: ReturnType<typeof labelAnswers>;
}): React.JSX.Element {
  if (answers.length === 0) {
    return <p className="text-muted-foreground">No content available</p>;
  }

  return (
    <div className="space-y-6">
      {answers.map(({ key, label, type, value }) => (
        <div key={key}>
          <h4 className="mb-2 text-sm font-medium text-muted-foreground">
            {label}
          </h4>
          <div className="text-base">
            {typeof value === "number" && (type === null || SCALE_MAX[type]) ? (
              <RatingDisplay
                value={value}
                max={(type && SCALE_MAX[type]) || (value > 5 ? 10 : 5)}
              />
            ) : typeof value === "string" ? (
              <p className="whitespace-pre-wrap">{value}</p>
            ) : typeof value === "boolean" ? (
              <p>{value ? "Yes" : "No"}</p>
            ) : typeof value === "number" ? (
              <p>{value}</p>
            ) : Array.isArray(value) ? (
              <ul className="list-inside list-disc">
                {value.map((item, i) => (
                  <li key={i}>{String(item)}</li>
                ))}
              </ul>
            ) : (
              <p>{JSON.stringify(value)}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function RatingDisplay({
  value,
  max: maxRating,
}: {
  value: number;
  max: number;
}): React.JSX.Element {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {Array.from({ length: maxRating }).map((_, i) => (
          <div
            key={i}
            className={`size-4 rounded-full ${
              i < value ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>
      <span className="text-sm text-muted-foreground">
        {value}/{maxRating}
      </span>
    </div>
  );
}
