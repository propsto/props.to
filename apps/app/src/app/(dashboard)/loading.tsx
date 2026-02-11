import { Skeleton } from "@propsto/ui/atoms/skeleton";
import {
  Card,
  CardFooter,
  CardHeader,
} from "@propsto/ui/atoms/card";

function StatsCardSkeleton(): React.JSX.Element {
  return (
    <Card className="@container/card" data-slot="card">
      <CardHeader className="relative">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="mt-2 h-8 w-16" />
        <div className="absolute right-4 top-4">
          <Skeleton className="size-5 rounded" />
        </div>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-40" />
      </CardFooter>
    </Card>
  );
}

export default function DashboardLoading(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-6 py-6">
      {/* Header Skeleton */}
      <div className="px-4 lg:px-6">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="mt-2 h-5 w-64" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        <StatsCardSkeleton />
        <StatsCardSkeleton />
        <StatsCardSkeleton />
        <StatsCardSkeleton />
      </div>

      {/* Recent Feedback Skeleton */}
      <div className="px-4 lg:px-6">
        <Skeleton className="mb-4 h-6 w-36" />
        <Skeleton className="h-16 w-full rounded-lg" />
      </div>

      {/* Quick Actions Skeleton */}
      <div className="px-4 lg:px-6">
        <Skeleton className="mb-4 h-6 w-32" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-20 rounded-lg" />
          <Skeleton className="h-20 rounded-lg" />
          <Skeleton className="h-20 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
