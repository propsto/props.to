import Link from "next/link";
import { formatDistanceToNow, format, isPast, isToday } from "date-fns";
import {
  Target,
  Calendar,
  Building2,
  MessageSquare,
  MoreHorizontal,
  Edit,
  Trash2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@propsto/ui/atoms/card";
import { Badge } from "@propsto/ui/atoms/badge";
import { Button } from "@propsto/ui/atoms/button";
import { Progress } from "@propsto/ui/atoms/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@propsto/ui/atoms/dropdown-menu";
import type { GoalWithFeedback } from "@propsto/data/repos/goal";

interface GoalListProps {
  goals: GoalWithFeedback[];
}

const statusBadgeVariant: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  NOT_STARTED: "outline",
  IN_PROGRESS: "default",
  COMPLETED: "secondary",
  CANCELLED: "destructive",
};

const statusLabel: Record<string, string> = {
  NOT_STARTED: "Not Started",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export function GoalList({ goals }: GoalListProps): React.JSX.Element {
  if (goals.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No goals to display
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {goals.map(goal => (
        <GoalCard key={goal.id} goal={goal} />
      ))}
    </div>
  );
}

function GoalCard({ goal }: { goal: GoalWithFeedback }): React.JSX.Element {
  const feedbackCount = goal.linkedFeedback.length;
  const isOverdue =
    goal.targetDate &&
    isPast(new Date(goal.targetDate)) &&
    goal.status !== "COMPLETED";
  const isDueToday = goal.targetDate && isToday(new Date(goal.targetDate));

  return (
    <Card className="group relative transition-colors hover:bg-muted/50">
      <Link href={`/goals/${goal.id}`} className="absolute inset-0 z-10">
        <span className="sr-only">View goal</span>
      </Link>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`flex size-10 items-center justify-center rounded-lg ${
                goal.status === "COMPLETED"
                  ? "bg-green-500/10"
                  : goal.status === "IN_PROGRESS"
                    ? "bg-blue-500/10"
                    : "bg-muted"
              }`}
            >
              <Target
                className={`size-5 ${
                  goal.status === "COMPLETED"
                    ? "text-green-500"
                    : goal.status === "IN_PROGRESS"
                      ? "text-blue-500"
                      : "text-muted-foreground"
                }`}
              />
            </div>
            <div>
              <CardTitle className="text-base font-medium line-clamp-1">
                {goal.title}
              </CardTitle>
              <CardDescription className="text-sm">
                Created{" "}
                {formatDistanceToNow(new Date(goal.createdAt), {
                  addSuffix: true,
                })}
              </CardDescription>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative z-20 size-8 opacity-0 group-hover:opacity-100"
              >
                <MoreHorizontal className="size-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/goals/${goal.id}/edit`} className="relative z-20">
                  <Edit className="mr-2 size-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="relative z-20 text-destructive">
                <Trash2 className="mr-2 size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {goal.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {goal.description}
            </p>
          )}

          {/* Progress bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{goal.progress}%</span>
            </div>
            <Progress value={goal.progress} className="h-2" />
          </div>

          {/* Status and context badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant={statusBadgeVariant[goal.status] || "outline"}>
              {statusLabel[goal.status] || goal.status}
            </Badge>
            {goal.organization && (
              <Badge variant="outline" className="text-xs">
                <Building2 className="mr-1 size-3" />
                {goal.organization.name}
              </Badge>
            )}
          </div>

          {/* Date and feedback count */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            {goal.targetDate && (
              <span
                className={`flex items-center gap-1 ${
                  isOverdue
                    ? "text-destructive"
                    : isDueToday
                      ? "text-orange-500"
                      : ""
                }`}
              >
                <Calendar className="size-3" />
                {isOverdue
                  ? "Overdue"
                  : isDueToday
                    ? "Due today"
                    : `Due ${format(new Date(goal.targetDate), "MMM d, yyyy")}`}
              </span>
            )}
            {feedbackCount > 0 && (
              <span className="flex items-center gap-1">
                <MessageSquare className="size-3" />
                {feedbackCount} linked{" "}
                {feedbackCount === 1 ? "feedback" : "feedbacks"}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
