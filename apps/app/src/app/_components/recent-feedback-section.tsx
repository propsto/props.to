import Link from "next/link";
import { getFeedbackForUser } from "@propsto/data/repos";
import { FeedbackList } from "./feedback-list";
import { NoFeedbackState } from "./empty-state";

interface RecentFeedbackSectionProps {
  userId: string;
}

/**
 * Async component for recent feedback section.
 * Wrap with Suspense for streaming.
 */
export async function RecentFeedbackSection({
  userId,
}: RecentFeedbackSectionProps): Promise<React.JSX.Element> {
  // Same filter as /feedback: only approved feedback reaches the recipient
  const result = await getFeedbackForUser(userId, {
    status: ["APPROVED"],
    take: 5,
  });
  const feedbacks = result.success ? result.data.feedbacks : [];
  const total = result.success ? result.data.total : 0;

  return (
    <div className="px-4 lg:px-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Recent Feedback</h2>
        {total > feedbacks.length && (
          <Link href="/feedback" className="text-sm text-primary underline">
            View all {total}
          </Link>
        )}
      </div>
      {feedbacks.length === 0 ? (
        <NoFeedbackState />
      ) : (
        <FeedbackList feedbacks={feedbacks} />
      )}
    </div>
  );
}
