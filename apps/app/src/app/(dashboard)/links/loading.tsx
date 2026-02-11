import { Skeleton } from "@propsto/ui/atoms/skeleton";

function LinkItemSkeleton(): React.JSX.Element {
  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div className="space-y-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-3 w-24" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-9 w-9 rounded-md" />
        <Skeleton className="h-9 w-9 rounded-md" />
      </div>
    </div>
  );
}

export default function LinksLoading(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-6 py-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div>
          <Skeleton className="h-8 w-40" />
          <Skeleton className="mt-2 h-5 w-64" />
        </div>
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>

      {/* Links List Skeleton */}
      <div className="px-4 lg:px-6">
        <Skeleton className="mb-4 h-6 w-36" />
        <div className="space-y-4">
          <LinkItemSkeleton />
          <LinkItemSkeleton />
          <LinkItemSkeleton />
        </div>
      </div>
    </div>
  );
}
