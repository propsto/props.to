import Link from "next/link";
import { auth } from "@/server/auth.server";
import { getFeedbackForUser } from "@propsto/data/repos";
import { FeedbackList } from "@/app/_components/feedback-list";
import { NoFeedbackState } from "@/app/_components/empty-state";
import { Button } from "@propsto/ui/atoms/button";
import { Plus } from "lucide-react";

export default async function FeedbackPage(): Promise<React.ReactNode> {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const userId = session.user.id;

  // Get feedback received by the user
  const feedbackResult = await getFeedbackForUser(userId, {
    status: ["APPROVED"],
    take: 50,
  });

  const feedbacks = feedbackResult.success ? feedbackResult.data.feedbacks : [];
  const total = feedbackResult.success ? feedbackResult.data.total : 0;

  return (
    <div className="flex flex-col gap-6 py-6">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div>
          <h1 className="text-2xl font-semibold">Feedback Received</h1>
          <p className="text-muted-foreground">
            {total > 0
              ? `You have received ${total} feedback items`
              : "Feedback you receive will appear here"}
          </p>
        </div>
        <Button asChild>
          <Link href="/links/new">
            <Plus className="mr-2 size-4" />
            Create Link
          </Link>
        </Button>
      </div>

      <div className="px-4 lg:px-6">
        {feedbacks.length === 0 ? (
          <NoFeedbackState />
        ) : (
          <FeedbackList feedbacks={feedbacks} />
        )}
      </div>
    </div>
  );
}
