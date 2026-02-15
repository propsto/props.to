import { Card, CardFooter, CardHeader } from "@propsto/ui/atoms/card";
import { Skeleton } from "@propsto/ui/atoms/skeleton";

export function StatsCardsSkeleton(): React.JSX.Element {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {[1, 2, 3, 4].map(i => (
        <Card key={i} className="@container/card" data-slot="card">
          <CardHeader className="relative">
            <Skeleton className="h-4 w-24" />
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
      ))}
    </div>
  );
}
