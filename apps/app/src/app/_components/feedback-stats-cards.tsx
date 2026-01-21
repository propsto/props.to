import {
  TrendingUp,
  TrendingDown,
  MessageSquare,
  Send,
  Clock,
  Star,
} from "lucide-react";
import { Badge } from "@propsto/ui/atoms/badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@propsto/ui/atoms/card";

export type FeedbackStats = {
  received: number;
  sent: number;
  pending: number;
  recentCount: number;
};

interface FeedbackStatsCardsProps {
  stats: FeedbackStats;
}

export function FeedbackStatsCards({
  stats,
}: FeedbackStatsCardsProps): React.JSX.Element {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card" data-slot="card">
        <CardHeader className="relative">
          <CardDescription>Feedback Received</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {stats.received}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <MessageSquare className="size-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.recentCount > 0 ? (
              <>
                <TrendingUp className="size-4 text-green-500" />+
                {stats.recentCount} this month
              </>
            ) : (
              <>
                <TrendingDown className="size-4 text-muted-foreground" />
                No new feedback
              </>
            )}
          </div>
          <div className="text-muted-foreground">
            Total feedback you&apos;ve received
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card" data-slot="card">
        <CardHeader className="relative">
          <CardDescription>Feedback Sent</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {stats.sent}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Send className="size-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Give feedback to help others grow
          </div>
          <div className="text-muted-foreground">
            Total feedback you&apos;ve given
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card" data-slot="card">
        <CardHeader className="relative">
          <CardDescription>Pending Review</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {stats.pending}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Clock className="size-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.pending > 0 ? (
              <Badge variant="secondary">
                {stats.pending} awaiting moderation
              </Badge>
            ) : (
              "All caught up!"
            )}
          </div>
          <div className="text-muted-foreground">
            Feedback pending moderation
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card" data-slot="card">
        <CardHeader className="relative">
          <CardDescription>Active Links</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            0
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Star className="size-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Create a feedback link to get started
          </div>
          <div className="text-muted-foreground">
            Share links to receive feedback
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
