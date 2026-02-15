import { getFeedbackStats } from "./cached-queries";
import { FeedbackStatsCards } from "./feedback-stats-cards";

interface FeedbackStatsProps {
  userId: string;
}

/**
 * Async server component that fetches stats.
 * Wrap with Suspense for streaming.
 */
export async function FeedbackStats({
  userId,
}: FeedbackStatsProps): Promise<React.JSX.Element> {
  const statsResult = await getFeedbackStats(userId);
  const stats = statsResult.success
    ? {
        received: statsResult.data.received,
        sent: statsResult.data.sent,
        pending: statsResult.data.pendingModeration,
        recentCount: statsResult.data.recentCount,
      }
    : { received: 0, sent: 0, pending: 0, recentCount: 0 };

  return <FeedbackStatsCards stats={stats} />;
}
