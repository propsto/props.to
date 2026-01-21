import Link from "next/link";
import { auth } from "@/server/auth.server";
import { getUserGoals, getGoalStats } from "@propsto/data/repos";
import { EmptyState } from "@/app/_components/empty-state";
import { GoalList } from "@/app/_components/goal-list";
import { GoalStatsCards } from "@/app/_components/goal-stats-cards";
import { Button } from "@propsto/ui/atoms/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@propsto/ui/atoms/tabs";
import { Plus, Target } from "lucide-react";

export default async function GoalsPage(): Promise<React.ReactNode> {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const userId = session.user.id;

  const [goalsResult, statsResult] = await Promise.all([
    getUserGoals(userId, { take: 50 }),
    getGoalStats(userId),
  ]);

  const goals = goalsResult.success ? goalsResult.data.goals : [];
  const total = goalsResult.success ? goalsResult.data.total : 0;
  const stats = statsResult.success ? statsResult.data : null;

  const activeGoals = goals.filter(
    g => g.status === "IN_PROGRESS" || g.status === "NOT_STARTED",
  );
  const completedGoals = goals.filter(g => g.status === "COMPLETED");
  const cancelledGoals = goals.filter(g => g.status === "CANCELLED");

  return (
    <div className="flex flex-col gap-6 py-6">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div>
          <h1 className="text-2xl font-semibold">Goals</h1>
          <p className="text-muted-foreground">
            {total > 0
              ? `Track your ${total} development ${total === 1 ? "goal" : "goals"}`
              : "Set goals and link feedback to track your growth"}
          </p>
        </div>
        <Button asChild>
          <Link href="/goals/new">
            <Plus className="mr-2 size-4" />
            New Goal
          </Link>
        </Button>
      </div>

      {stats && stats.total > 0 && (
        <div className="px-4 lg:px-6">
          <GoalStatsCards stats={stats} />
        </div>
      )}

      <div className="px-4 lg:px-6">
        {goals.length === 0 ? (
          <EmptyState
            title="No goals yet"
            description="Goals help you track your professional development and link feedback to specific objectives."
            actionLabel="Create Goal"
            actionHref="/goals/new"
            icon={Target}
          />
        ) : (
          <Tabs defaultValue="active" className="w-full">
            <TabsList>
              <TabsTrigger value="active">
                Active ({activeGoals.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({completedGoals.length})
              </TabsTrigger>
              {cancelledGoals.length > 0 && (
                <TabsTrigger value="cancelled">
                  Cancelled ({cancelledGoals.length})
                </TabsTrigger>
              )}
            </TabsList>
            <TabsContent value="active" className="mt-6">
              {activeGoals.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No active goals
                </div>
              ) : (
                <GoalList goals={activeGoals} />
              )}
            </TabsContent>
            <TabsContent value="completed" className="mt-6">
              {completedGoals.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No completed goals yet
                </div>
              ) : (
                <GoalList goals={completedGoals} />
              )}
            </TabsContent>
            {cancelledGoals.length > 0 && (
              <TabsContent value="cancelled" className="mt-6">
                <GoalList goals={cancelledGoals} />
              </TabsContent>
            )}
          </Tabs>
        )}
      </div>
    </div>
  );
}
