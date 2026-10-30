import Link from "next/link";
import { auth } from "@/server/auth.server";
import {
  getFeedbackForUser,
  getReceivedFeedbackValues,
} from "@propsto/data/repos";
import { FeedbackList } from "@/app/_components/feedback-list";
import { NoFeedbackState } from "@/app/_components/empty-state";
import { Button } from "@propsto/ui/atoms/button";
import { Badge } from "@propsto/ui/atoms/badge";
import { Plus } from "lucide-react";
import { Pager, parsePage } from "@/app/_components/pager";

const PAGE_SIZE = 20;

export default async function FeedbackPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; value?: string }>;
}): Promise<React.ReactNode> {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const userId = session.user.id;
  const params = await searchParams;
  const page = parsePage(params.page);

  // Value filter: only values tagged on this user's received feedback are offered,
  // and an unknown ?value= falls back to the unfiltered list
  const valuesResult = await getReceivedFeedbackValues(userId);
  const values = valuesResult.success ? valuesResult.data : [];
  const activeValue = values.find(v => v.id === params.value);

  // Get feedback received by the user
  const feedbackResult = await getFeedbackForUser(userId, {
    status: ["APPROVED"],
    valueId: activeValue?.id,
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  const feedbacks = feedbackResult.success ? feedbackResult.data.feedbacks : [];
  const total = feedbackResult.success ? feedbackResult.data.total : 0;

  return (
    <div className="flex flex-col gap-6 py-6">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div>
          <h1 className="text-2xl font-semibold">Feedback Received</h1>
          <p className="text-muted-foreground">
            {total > 0
              ? `You have received ${total} feedback items`
              : "Feedback you receive will appear here"}
          </p>
        </div>
        <Button asChild>
          <Link href="/links/new">
            <Plus className="mr-2 size-4" />
            Create Link
          </Link>
        </Button>
      </div>

      {values.length > 0 && (
        <nav
          aria-label="Filter by value"
          className="flex flex-wrap items-center gap-2 px-4 lg:px-6"
        >
          <Link href="/feedback">
            <Badge variant={activeValue ? "outline" : "default"}>All</Badge>
          </Link>
          {values.map(value => (
            <Link
              key={value.id}
              href={`/feedback?value=${value.id}`}
              aria-current={value.id === activeValue?.id ? "page" : undefined}
            >
              <Badge
                variant={value.id === activeValue?.id ? "default" : "outline"}
              >
                {value.name}
              </Badge>
            </Link>
          ))}
        </nav>
      )}

      <div className="px-4 lg:px-6">
        {feedbacks.length === 0 ? (
          <NoFeedbackState />
        ) : (
          <>
            <FeedbackList feedbacks={feedbacks} />
            <Pager
              basePath={
                activeValue ? `/feedback?value=${activeValue.id}` : "/feedback"
              }
              currentPage={page}
              totalPages={Math.ceil(total / PAGE_SIZE)}
            />
          </>
        )}
      </div>
    </div>
  );
}
