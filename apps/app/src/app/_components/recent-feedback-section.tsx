import Link from "next/link";
import { getFeedbackStats } from "./cached-queries";
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
  const statsResult = await getFeedbackStats(userId);
  const receivedCount = statsResult.success ? statsResult.data.received : 0;

  return (
    <div className="px-4 lg:px-6">
      <h2 className="mb-4 text-lg font-semibold">Recent Feedback</h2>
      {receivedCount === 0 ? (
        <NoFeedbackState />
      ) : (
        <div className="text-muted-foreground">
          You have {receivedCount} feedback items.{" "}
          <Link href="/feedback" className="text-primary underline">
            View all
          </Link>
        </div>
      )}
    </div>
  );
}
