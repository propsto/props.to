import Link from "next/link";
import { auth } from "@/server/auth.server";
import { getFeedbackByUser } from "@propsto/data/repos";
import { FeedbackList } from "@/app/_components/feedback-list";
import { EmptyState } from "@/app/_components/empty-state";
import { Button } from "@propsto/ui/atoms/button";
import { Send } from "lucide-react";

export default async function FeedbackSentPage(): Promise<React.ReactNode> {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const userId = session.user.id;

  // Get feedback sent by the user
  const feedbackResult = await getFeedbackByUser(userId, {
    take: 50,
  });

  const feedbacks = feedbackResult.success ? feedbackResult.data.feedbacks : [];
  const total = feedbackResult.success ? feedbackResult.data.total : 0;

  return (
    <div className="flex flex-col gap-6 py-6">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div>
          <h1 className="text-2xl font-semibold">Feedback Sent</h1>
          <p className="text-muted-foreground">
            {total > 0
              ? `You have sent ${total} feedback items`
              : "Feedback you give will appear here"}
          </p>
        </div>
      </div>

      <div className="px-4 lg:px-6">
        {feedbacks.length === 0 ? (
          <EmptyState
            title="No feedback sent yet"
            description="When you give feedback to others, it will appear here."
            icon={Send}
          />
        ) : (
          <FeedbackList feedbacks={feedbacks} showRecipient />
        )}
      </div>
    </div>
  );
}
