import { Skeleton } from "@propsto/ui/atoms/skeleton";

function FeedbackItemSkeleton(): React.JSX.Element {
  return (
    <div className="flex items-start gap-4 rounded-lg border p-4">
      <Skeleton className="size-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-full max-w-md" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

export default function FeedbackLoading(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-6 py-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div>
          <Skeleton className="h-8 w-44" />
          <Skeleton className="mt-2 h-5 w-56" />
        </div>
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>

      {/* Feedback List Skeleton */}
      <div className="space-y-4 px-4 lg:px-6">
        <FeedbackItemSkeleton />
        <FeedbackItemSkeleton />
        <FeedbackItemSkeleton />
        <FeedbackItemSkeleton />
      </div>
    </div>
  );
}
