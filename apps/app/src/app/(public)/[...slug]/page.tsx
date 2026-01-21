import { notFound } from "next/navigation";
import { resolveSlug, resolveOrgSlug } from "@propsto/data/repos";
import {
  getFeedbackLinkBySlug,
  getUserFeedbackLinks,
} from "@propsto/data/repos";
import { FeedbackSubmissionForm } from "./_components/feedback-form";
import { UserProfileHeader } from "./_components/user-profile-header";

interface PublicPageProps {
  params: Promise<{ slug: string[] }>;
}

/**
 * Dynamic route handler for public feedback pages:
 * - /<username> - User profile page
 * - /<username>/<linkSlug> - Personal feedback link
 * - /<orgSlug>/<username>/<linkSlug> - Organization feedback link
 */
export default async function PublicPage({
  params,
}: PublicPageProps): Promise<React.ReactNode> {
  const { slug } = await params;

  if (!slug || slug.length === 0) {
    notFound();
  }

  // Handle based on number of segments
  if (slug.length === 1) {
    // /<username> or /<orgSlug> - Profile page
    return handleProfilePage(slug[0]);
  }

  if (slug.length === 2) {
    // Could be /<username>/<linkSlug> OR /<orgSlug>/<username>
    return handleTwoSegments(slug[0], slug[1]);
  }

  if (slug.length === 3) {
    // /<orgSlug>/<username>/<linkSlug>
    return handleOrgFeedbackLink(slug[0], slug[1], slug[2]);
  }

  notFound();
}

async function handleProfilePage(
  firstSegment: string,
): Promise<React.ReactNode> {
  const slugResult = await resolveSlug(firstSegment);

  if (!slugResult.success || !slugResult.data) {
    notFound();
  }

  const resolution = slugResult.data;

  if (resolution.type === "user") {
    // Show user profile with their public feedback links
    const linksResult = await getUserFeedbackLinks(resolution.userId, {
      isActive: true,
    });
    const links = linksResult.success ? linksResult.data.links : [];

    return (
      <div className="max-w-2xl mx-auto">
        <UserProfileHeader userId={resolution.userId} slug={resolution.slug} />
        {links.length > 0 ? (
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">Feedback Links</h2>
            <div className="grid gap-4">
              {links.map(link => (
                <a
                  key={link.id}
                  href={`/${resolution.slug}/${link.slug}`}
                  className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <h3 className="font-medium">{link.name}</h3>
                  {link.template && (
                    <p className="text-sm text-muted-foreground">
                      {link.template.name}
                    </p>
                  )}
                </a>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-center text-muted-foreground mt-8">
            No public feedback links available
          </p>
        )}
      </div>
    );
  }

  if (resolution.type === "organization") {
    // Show organization profile (could list members or redirect)
    return (
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-3xl font-bold mb-4">Organization Profile</h1>
        <p className="text-muted-foreground">
          This is an organization. Visit a specific member&apos;s profile to
          give feedback.
        </p>
      </div>
    );
  }

  notFound();
}

async function handleTwoSegments(
  firstSegment: string,
  secondSegment: string,
): Promise<React.ReactNode> {
  // First, check if first segment is a user (personal feedback link)
  const slugResult = await resolveSlug(firstSegment);

  if (slugResult.success && slugResult.data?.type === "user") {
    // /<username>/<linkSlug> - Personal feedback link
    return handlePersonalFeedbackLink(
      slugResult.data.userId,
      firstSegment,
      secondSegment,
    );
  }

  if (slugResult.success && slugResult.data?.type === "organization") {
    // /<orgSlug>/<username> - Org member profile
    const orgSlugResult = await resolveOrgSlug(firstSegment, secondSegment);

    if (orgSlugResult.success && orgSlugResult.data?.type === "user") {
      // Show org member profile
      const linksResult = await getUserFeedbackLinks(
        orgSlugResult.data.userId,
        {
          organizationId: orgSlugResult.data.organizationId,
          isActive: true,
        },
      );
      const links = linksResult.success ? linksResult.data.links : [];

      return (
        <div className="max-w-2xl mx-auto">
          <UserProfileHeader
            userId={orgSlugResult.data.userId}
            slug={secondSegment}
            organizationId={orgSlugResult.data.organizationId}
          />
          {links.length > 0 ? (
            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-4">Feedback Links</h2>
              <div className="grid gap-4">
                {links.map(link => (
                  <a
                    key={link.id}
                    href={`/${firstSegment}/${secondSegment}/${link.slug}`}
                    className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <h3 className="font-medium">{link.name}</h3>
                    {link.template && (
                      <p className="text-sm text-muted-foreground">
                        {link.template.name}
                      </p>
                    )}
                  </a>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground mt-8">
              No feedback links available
            </p>
          )}
        </div>
      );
    }
  }

  notFound();
}

async function handlePersonalFeedbackLink(
  userId: string,
  username: string,
  linkSlug: string,
): Promise<React.ReactNode> {
  // Find the feedback link by slug for this user (personal link has no organizationId)
  const linkResult = await getFeedbackLinkBySlug(linkSlug, userId, null);

  if (!linkResult.success || !linkResult.data) {
    notFound();
  }

  const link = linkResult.data;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Give Feedback to {link.user.firstName || username}
        </h1>
        <p className="text-muted-foreground">{link.name}</p>
      </div>
      <FeedbackSubmissionForm
        link={link}
        basePath={`/${username}/${linkSlug}`}
      />
    </div>
  );
}

async function handleOrgFeedbackLink(
  orgSlug: string,
  username: string,
  linkSlug: string,
): Promise<React.ReactNode> {
  // Resolve the org and user
  const orgUserResult = await resolveOrgSlug(orgSlug, username);

  if (
    !orgUserResult.success ||
    !orgUserResult.data ||
    orgUserResult.data.type !== "user"
  ) {
    notFound();
  }

  const { userId, organizationId } = orgUserResult.data;

  // Find the feedback link for this user within this org
  const linkResult = await getFeedbackLinkBySlug(
    linkSlug,
    userId,
    organizationId,
  );

  if (!linkResult.success || !linkResult.data) {
    notFound();
  }

  const link = linkResult.data;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Give Feedback to {link.user.firstName || username}
        </h1>
        <p className="text-muted-foreground">{link.name}</p>
        {link.organization && (
          <p className="text-sm text-muted-foreground mt-1">
            via {link.organization.name}
          </p>
        )}
      </div>
      <FeedbackSubmissionForm
        link={link}
        basePath={`/${orgSlug}/${username}/${linkSlug}`}
      />
    </div>
  );
}
