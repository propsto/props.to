// Example: Improved Dashboard with React Server Components and shadcn/ui
// This demonstrates best practices for data fetching and component composition

import { Suspense } from "react";
import { auth } from "@propsto/auth/server.config";
import { db } from "@propsto/data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
  Badge,
  Button,
  Separator,
} from "@propsto/ui/atoms";
import {
  SiteHeader,
  DataTable,
  ChartAreaInteractive,
} from "@propsto/ui/molecules";
import { SidebarProvider, SidebarInset } from "@propsto/ui/atoms/sidebar";
import { AppSidebar } from "@propsto/ui/molecules/app-sidebar";
import { TrendingUp, Users, MessageSquare, Star } from "lucide-react";
import { cache } from "react";

// Cached data fetching functions for RSC
const getDashboardStats = cache(async (userId: string) => {
  const stats = await db.user.findUnique({
    where: { id: userId },
    select: {
      _count: {
        select: {
          feedbacks: true,
          organizations: true,
        },
      },
      feedbacks: {
        select: {
          rating: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 100, // For trend calculation
      },
    },
  });

  if (!stats) throw new Error("User not found");

  const totalFeedbacks = stats._count.feedbacks;
  const totalOrganizations = stats._count.organizations;
  const averageRating =
    stats.feedbacks.length > 0
      ? stats.feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) /
        stats.feedbacks.length
      : 0;

  // Calculate trend (last 30 days vs previous 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  const recentFeedbacks = stats.feedbacks.filter(
    f => f.createdAt > thirtyDaysAgo,
  ).length;
  const previousFeedbacks = stats.feedbacks.filter(
    f => f.createdAt > sixtyDaysAgo && f.createdAt <= thirtyDaysAgo,
  ).length;

  const trend =
    previousFeedbacks > 0
      ? ((recentFeedbacks - previousFeedbacks) / previousFeedbacks) * 100
      : recentFeedbacks > 0
        ? 100
        : 0;

  return {
    totalFeedbacks,
    totalOrganizations,
    averageRating,
    trend,
    recentFeedbacks,
  };
});

const getRecentFeedbacks = cache(async (userId: string) => {
  return await db.feedback.findMany({
    where: {
      author: { id: userId },
    },
    include: {
      author: {
        select: {
          name: true,
          email: true,
          image: true,
        },
      },
      organization: {
        select: {
          name: true,
          slug: { select: { value: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
});

// Stats Cards Component (Server Component)
async function StatsCards({ userId }: { userId: string }) {
  const stats = await getDashboardStats(userId);

  const statItems = [
    {
      title: "Total Feedback",
      value: stats.totalFeedbacks.toString(),
      description: `${stats.recentFeedbacks} this month`,
      icon: MessageSquare,
      trend: stats.trend,
    },
    {
      title: "Organizations",
      value: stats.totalOrganizations.toString(),
      description: "Active organizations",
      icon: Users,
    },
    {
      title: "Average Rating",
      value: stats.averageRating.toFixed(1),
      description: "Out of 5 stars",
      icon: Star,
    },
    {
      title: "Growth",
      value: `${stats.trend > 0 ? "+" : ""}${stats.trend.toFixed(1)}%`,
      description: "vs last month",
      icon: TrendingUp,
      trend: stats.trend,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statItems.map((item, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
            <item.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.value}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              {item.trend !== undefined && (
                <Badge
                  variant={item.trend >= 0 ? "default" : "destructive"}
                  className="text-xs"
                >
                  {item.trend >= 0 ? "+" : ""}
                  {item.trend.toFixed(1)}%
                </Badge>
              )}
              {item.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Recent Feedback Component (Server Component)
async function RecentFeedback({ userId }: { userId: string }) {
  const feedbacks = await getRecentFeedbacks(userId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Feedback</CardTitle>
        <CardDescription>Your latest feedback submissions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {feedbacks.map((feedback, index) => (
            <div key={feedback.id}>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {feedback.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {feedback.organization?.name} •{" "}
                    {feedback.createdAt.toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {feedback.rating && (
                    <Badge variant="outline">{feedback.rating}/5 ⭐</Badge>
                  )}
                  <Badge
                    variant={
                      feedback.status === "PUBLISHED" ? "default" : "secondary"
                    }
                  >
                    {feedback.status}
                  </Badge>
                </div>
              </div>
              {index < feedbacks.length - 1 && <Separator className="mt-4" />}
            </div>
          ))}
          {feedbacks.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No feedback found. Start by creating your first feedback!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Loading Components
function StatsCardsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function RecentFeedbackSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32 mb-2" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-5 w-12" />
                <Skeleton className="h-5 w-16" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Main Dashboard Page (Server Component)
export default async function ImprovedDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-6 p-6">
            {/* Stats Section with Suspense */}
            <Suspense fallback={<StatsCardsSkeleton />}>
              <StatsCards userId={session.user.id} />
            </Suspense>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Chart Section */}
              <div className="md:col-span-1">
                <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                  <ChartAreaInteractive />
                </Suspense>
              </div>

              {/* Recent Feedback */}
              <div className="md:col-span-1">
                <Suspense fallback={<RecentFeedbackSkeleton />}>
                  <RecentFeedback userId={session.user.id} />
                </Suspense>
              </div>
            </div>

            {/* Data Table Section */}
            <Suspense fallback={<Skeleton className="h-96 w-full" />}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>All Feedback</CardTitle>
                    <CardDescription>
                      Manage and view all your feedback submissions
                    </CardDescription>
                  </div>
                  <Button>Create Feedback</Button>
                </CardHeader>
                <CardContent>
                  {/* This would be replaced with actual data */}
                  <DataTable data={[]} />
                </CardContent>
              </Card>
            </Suspense>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

// Error Boundary for the page
export function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Something went wrong!</h2>
        <p className="text-muted-foreground max-w-md">
          {error.message ||
            "An unexpected error occurred while loading the dashboard."}
        </p>
      </div>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}

// Loading page
export function Loading() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-6 p-6">
            <StatsCardsSkeleton />
            <div className="grid gap-6 md:grid-cols-2">
              <Skeleton className="h-96 w-full" />
              <RecentFeedbackSkeleton />
            </div>
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
