import { Skeleton } from "@propsto/ui/atoms/skeleton";

function TemplateItemSkeleton(): React.JSX.Element {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-8 w-20 rounded-md" />
      </div>
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    </div>
  );
}

export default function TemplatesLoading(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-6 py-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-2 h-5 w-80" />
        </div>
        <Skeleton className="h-10 w-36 rounded-md" />
      </div>

      {/* Tabs Skeleton */}
      <div className="px-4 lg:px-6">
        <div className="mb-6 flex gap-2">
          <Skeleton className="h-10 w-36 rounded-md" />
          <Skeleton className="h-10 w-44 rounded-md" />
        </div>

        {/* Template List Skeleton */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <TemplateItemSkeleton />
          <TemplateItemSkeleton />
          <TemplateItemSkeleton />
          <TemplateItemSkeleton />
          <TemplateItemSkeleton />
          <TemplateItemSkeleton />
        </div>
      </div>
    </div>
  );
}
