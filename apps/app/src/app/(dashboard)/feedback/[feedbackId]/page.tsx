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
import { getFeedback } from "@propsto/data/repos";
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
                {feedback.fieldsData ? (
                  <FeedbackContent
                    data={feedback.fieldsData as Record<string, unknown>}
                  />
                ) : (
                  <p className="text-muted-foreground">No content available</p>
                )}
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
  data,
}: {
  data: Record<string, unknown>;
}): React.JSX.Element {
  const entries = Object.entries(data).filter(
    ([, value]) => value !== null && value !== undefined && value !== "",
  );

  if (entries.length === 0) {
    return <p className="text-muted-foreground">No content available</p>;
  }

  return (
    <div className="space-y-6">
      {entries.map(([key, value]) => (
        <div key={key}>
          <h4 className="mb-2 text-sm font-medium text-muted-foreground capitalize">
            {key.replace(/([A-Z])/g, " $1").replace(/_/g, " ")}
          </h4>
          <div className="text-base">
            {typeof value === "string" ? (
              <p className="whitespace-pre-wrap">{value}</p>
            ) : typeof value === "number" ? (
              <RatingDisplay value={value} />
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

function RatingDisplay({ value }: { value: number }): React.JSX.Element {
  // Assume ratings are 1-5 or 1-10
  const maxRating = value > 5 ? 10 : 5;
  const percentage = (value / maxRating) * 100;

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
