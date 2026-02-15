import { Suspense } from "react";
import Link from "next/link";
import { auth } from "@/server/auth.server";
import { FeedbackStats } from "@/app/_components/feedback-stats";
import { StatsCardsSkeleton } from "@/app/_components/stats-cards-skeleton";
import { RecentFeedbackSection } from "@/app/_components/recent-feedback-section";
import { RecentFeedbackSkeleton } from "@/app/_components/recent-feedback-skeleton";

export default async function DashboardPage(): Promise<React.ReactNode> {
  const session = await auth();
  if (!session?.user?.id) {
    return null; // Layout handles redirect
  }

  const userId = session.user.id;

  return (
    <div className="flex flex-col gap-6 py-6">
      <div className="px-4 lg:px-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s your feedback overview.
        </p>
      </div>

      {/* Stats Cards - Streamed with Suspense */}
      <Suspense fallback={<StatsCardsSkeleton />}>
        <FeedbackStats userId={userId} />
      </Suspense>

      {/* Recent Feedback - Streamed with Suspense */}
      <Suspense fallback={<RecentFeedbackSkeleton />}>
        <RecentFeedbackSection userId={userId} />
      </Suspense>

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
