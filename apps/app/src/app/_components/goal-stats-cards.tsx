import { Target, CheckCircle, Clock, XCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@propsto/ui/atoms/card";

interface GoalStatsCardsProps {
  stats: {
    total: number;
    completed: number;
    inProgress: number;
    notStarted: number;
    cancelled: number;
    averageProgress: number;
  };
}

export function GoalStatsCards({
  stats,
}: GoalStatsCardsProps): React.JSX.Element {
  const completionRate =
    stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
          <Target className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">
            {stats.inProgress + stats.notStarted} active
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completed</CardTitle>
          <CheckCircle className="size-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.completed}</div>
          <p className="text-xs text-muted-foreground">
            {completionRate}% completion rate
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          <Clock className="size-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.inProgress}</div>
          <p className="text-xs text-muted-foreground">
            {Math.round(stats.averageProgress)}% avg progress
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Not Started</CardTitle>
          <XCircle className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.notStarted}</div>
          <p className="text-xs text-muted-foreground">Awaiting action</p>
        </CardContent>
      </Card>
    </div>
  );
}
