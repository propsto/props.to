import Link from "next/link";
import { auth } from "@/server/auth.server";
import { getUserFeedbackLinks } from "@propsto/data/repos";
import { NoLinksState } from "@/app/_components/empty-state";
import { LinkList } from "@/app/_components/link-list";
import { Button } from "@propsto/ui/atoms/button";
import { Plus } from "lucide-react";

export default async function LinksPage(): Promise<React.ReactNode> {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const userId = session.user.id;

  const linksResult = await getUserFeedbackLinks(userId, { take: 50 });

  const links = linksResult.success ? linksResult.data.links : [];
  const total = linksResult.success ? linksResult.data.total : 0;

  const activeLinks = links.filter(l => l.isActive);
  const inactiveLinks = links.filter(l => !l.isActive);

  return (
    <div className="flex flex-col gap-6 py-6">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div>
          <h1 className="text-2xl font-semibold">Feedback Links</h1>
          <p className="text-muted-foreground">
            {total > 0
              ? `You have ${total} feedback ${total === 1 ? "link" : "links"}`
              : "Create links to collect feedback from anyone"}
          </p>
        </div>
        <Button asChild>
          <Link href="/links/new">
            <Plus className="mr-2 size-4" />
            Create Link
          </Link>
        </Button>
      </div>

      <div className="px-4 lg:px-6">
        {links.length === 0 ? (
          <NoLinksState />
        ) : (
          <div className="space-y-8">
            {activeLinks.length > 0 && (
              <div>
                <h2 className="mb-4 text-lg font-medium">
                  Active Links ({activeLinks.length})
                </h2>
                <LinkList links={activeLinks} />
              </div>
            )}
            {inactiveLinks.length > 0 && (
              <div>
                <h2 className="mb-4 text-lg font-medium text-muted-foreground">
                  Paused Links ({inactiveLinks.length})
                </h2>
                <LinkList links={inactiveLinks} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
