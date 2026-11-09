import { notFound } from "next/navigation";
import {
  getOrganizationById,
  getOrganizationFeedbackLinks,
} from "@propsto/data/repos";
import { auth } from "@/server/auth.server";
import { getFeedbackPolicy } from "@/lib/feedback-policy";
import { publicLinkPath } from "@/lib/public-link-path";

export async function orgPage({
  organizationId,
}: {
  organizationId: string;
}): Promise<React.ReactNode> {
  const session = await auth();
  const [orgResult, policy] = await Promise.all([
    getOrganizationById(organizationId),
    // The org page is not a link: the org-wide policy, no recipient
    getFeedbackPolicy({ organizationId, userId: null }, session?.user?.id),
  ]);
  if (!orgResult.success || !orgResult.data) {
    notFound();
  }

  // Don't hand outsiders the staff directory when they can't give feedback anyway
  const listLinks = policy.enabled && (!policy.membersOnly || policy.isMember);

  // ponytail: first 50 links, add paging when an org lists more
  const linksResult = listLinks
    ? await getOrganizationFeedbackLinks(organizationId, {
        publicOnly: true,
        take: 50,
      })
    : null;

  // Removed members' links are deactivated, so publicOnly leaves current members'
  const links = (linksResult?.success ? linksResult.data.links : []).map(
    link => ({
      ...link,
      owner: [link.user?.firstName, link.user?.lastName]
        .filter(Boolean)
        .join(" "),
      href: publicLinkPath(link),
    }),
  );

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">{orgResult.data.name}</h1>
      </div>
      {links.length > 0 ? (
        <div>
          <h2 className="text-lg font-semibold mb-4">Feedback Links</h2>
          <div className="grid gap-4">
            {links.map(link => (
              <a
                key={link.id}
                href={link.href}
                className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <h3 className="font-medium">{link.name}</h3>
                <p className="text-sm text-muted-foreground">{link.owner}</p>
              </a>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-center text-muted-foreground">
          No public feedback links available
        </p>
      )}
    </div>
  );
}
