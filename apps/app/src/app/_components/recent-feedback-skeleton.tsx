import { Skeleton } from "@propsto/ui/atoms/skeleton";

export function RecentFeedbackSkeleton(): React.JSX.Element {
  return (
    <div className="px-4 lg:px-6">
      <Skeleton className="mb-4 h-7 w-36" />
      <Skeleton className="h-4 w-64" />
    </div>
  );
}
