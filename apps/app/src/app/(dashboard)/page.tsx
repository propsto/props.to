import Link from "next/link";
import { auth } from "@/server/auth.server";
import { FeedbackStatsCards } from "@/app/_components/feedback-stats-cards";
import { NoFeedbackState } from "@/app/_components/empty-state";
import { getFeedbackStats } from "@propsto/data/repos";

export default async function DashboardPage(): Promise<React.ReactNode> {
  const session = await auth();
  if (!session?.user?.id) {
    return null; // Layout handles redirect
  }

  const userId = session.user.id;

  // Get feedback stats for the user
  const statsResult = await getFeedbackStats(userId);
  const stats = statsResult.success
    ? {
        received: statsResult.data.received,
        sent: statsResult.data.sent,
        pending: statsResult.data.pendingModeration,
        recentCount: statsResult.data.recentCount,
      }
    : { received: 0, sent: 0, pending: 0, recentCount: 0 };

  return (
    <div className="flex flex-col gap-6 py-6">
      <div className="px-4 lg:px-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s your feedback overview.
        </p>
      </div>

      {/* Stats Cards */}
      <FeedbackStatsCards stats={stats} />

      {/* Recent Feedback or Empty State */}
      <div className="px-4 lg:px-6">
        <h2 className="mb-4 text-lg font-semibold">Recent Feedback</h2>
        {stats.received === 0 ? (
          <NoFeedbackState />
        ) : (
          <div className="text-muted-foreground">
            You have {stats.received} feedback items.{" "}
            <Link href="/feedback" className="text-primary underline">
              View all
            </Link>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="px-4 lg:px-6">
        <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/links/new"
            className="rounded-lg border p-4 transition-colors hover:bg-muted"
          >
            <h3 className="font-medium">Create Feedback Link</h3>
            <p className="text-sm text-muted-foreground">
              Share a link to receive feedback
            </p>
          </Link>
          <Link
            href="/templates"
            className="rounded-lg border p-4 transition-colors hover:bg-muted"
          >
            <h3 className="font-medium">Browse Templates</h3>
            <p className="text-sm text-muted-foreground">
              Customize your feedback forms
            </p>
          </Link>
          <Link
            href="/goals/new"
            className="rounded-lg border p-4 transition-colors hover:bg-muted"
          >
            <h3 className="font-medium">Set a Goal</h3>
            <p className="text-sm text-muted-foreground">
              Track your growth with feedback
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
