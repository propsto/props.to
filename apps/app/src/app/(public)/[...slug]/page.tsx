import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Users } from "lucide-react";
import { resolveSlug, resolveOrgSlug } from "@propsto/data/repos";
import {
  getFeedbackLinkBySlug,
  getGroupFeedbackLinkBySlug,
  getUserFeedbackLinks,
  getGroupForPublicPage,
} from "@propsto/data/repos";
import { Button } from "@propsto/ui/atoms/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@propsto/ui/atoms/card";
import { Avatar, AvatarFallback, AvatarImage } from "@propsto/ui/atoms/avatar";
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
 * - /...path/thanks - Thank you page after feedback submission
 */
export default async function PublicPage({
  params,
}: PublicPageProps): Promise<React.ReactNode> {
  const { slug } = await params;

  if (!slug || slug.length === 0) {
    notFound();
  }

  // Check if this is a "thanks" page (last segment is "thanks")
  if (slug[slug.length - 1] === "thanks") {
    return <ThankYouPage />;
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
    // /<orgSlug>/<userSlug>/<linkSlug> OR /<orgSlug>/<groupSlug>/<linkSlug>
    return handleThreeSegments(slug[0], slug[1], slug[2]);
  }

  notFound();
}

function ThankYouPage(): React.ReactNode {
  return (
    <div className="max-w-md mx-auto">
      <Card className="text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="size-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Thank You!</CardTitle>
          <CardDescription>
            Your feedback has been submitted successfully
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Your feedback helps people grow and improve. Thank you for taking
            the time to share your thoughts.
          </p>
          <div className="flex flex-col gap-2">
            <Button asChild variant="outline">
              <Link href="/">Learn More About Props.to</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
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
    // Show user profile with their public feedback links (exclude hidden)
    const linksResult = await getUserFeedbackLinks(resolution.userId, {
      isActive: true,
      excludeHidden: true,
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
    // /<orgSlug>/<userSlug|groupSlug> - Org member profile or Group page
    const orgSlugResult = await resolveOrgSlug(firstSegment, secondSegment);

    if (orgSlugResult.success && orgSlugResult.data?.type === "user") {
      // Show org member profile (exclude hidden links)
      const linksResult = await getUserFeedbackLinks(
        orgSlugResult.data.userId,
        {
          organizationId: orgSlugResult.data.organizationId,
          isActive: true,
          excludeHidden: true,
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

    if (orgSlugResult.success && orgSlugResult.data?.type === "group") {
      // /<orgSlug>/<groupSlug> - Group page
      return handleGroupPage(
        orgSlugResult.data.groupId,
        firstSegment,
        secondSegment,
      );
    }
  }

  notFound();
}

async function handleGroupPage(
  groupId: string,
  orgSlug: string,
  groupSlug: string,
): Promise<React.ReactNode> {
  // Get group data with visibility check (no auth for public pages)
  const groupResult = await getGroupForPublicPage(groupId);

  if (!groupResult.success || !groupResult.data) {
    notFound();
  }

  const group = groupResult.data;

  // Get user's org slug for building URLs
  const getMemberOrgSlug = (
    user: (typeof group.users)[0],
    organizationId: string,
  ): string | null => {
    const orgSlugRecord = user.organizationSlugs.find(
      s => s.scopedToOrgId === organizationId,
    );
    return orgSlugRecord?.slug ?? null;
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Group Header */}
      <div className="text-center mb-8">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
          <Users className="size-8 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-bold mb-2">{group.name}</h1>
        {group.description && (
          <p className="text-muted-foreground">{group.description}</p>
        )}
        <p className="text-sm text-muted-foreground mt-2">
          {group.organization.name} • {group.users.length} member
          {group.users.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Group Feedback Links */}
      {group.feedbackLinks.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Group Feedback</h2>
          <div className="grid gap-4">
            {group.feedbackLinks.map(link => (
              <a
                key={link.id}
                href={`/${orgSlug}/${groupSlug}/${link.slug}`}
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
      )}

      {/* Members List */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Members</h2>
        <div className="grid gap-4">
          {group.users.map(user => {
            const userOrgSlug = getMemberOrgSlug(user, group.organizationId);
            const displayName =
              [user.firstName, user.lastName].filter(Boolean).join(" ") ||
              userOrgSlug ||
              "Member";
            const initials = displayName
              .split(" ")
              .map(n => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            return (
              <a
                key={user.id}
                href={userOrgSlug ? `/${orgSlug}/${userOrgSlug}` : undefined}
                className={`flex items-center gap-4 p-4 border rounded-lg ${userOrgSlug ? "hover:bg-muted/50 transition-colors cursor-pointer" : ""}`}
              >
                <Avatar className="size-12">
                  <AvatarImage
                    src={user.image ?? undefined}
                    alt={displayName}
                  />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{displayName}</h3>
                  {userOrgSlug && (
                    <p className="text-sm text-muted-foreground">
                      @{userOrgSlug}
                    </p>
                  )}
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
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

async function handleThreeSegments(
  orgSlug: string,
  secondSegment: string,
  linkSlug: string,
): Promise<React.ReactNode> {
  // Resolve the second segment - could be a user or a group
  const resolution = await resolveOrgSlug(orgSlug, secondSegment);

  if (!resolution.success || !resolution.data) {
    notFound();
  }

  if (resolution.data.type === "user") {
    // /<orgSlug>/<userSlug>/<linkSlug> - User feedback link
    return handleOrgUserFeedbackLink(
      orgSlug,
      secondSegment,
      linkSlug,
      resolution.data.userId,
      resolution.data.organizationId,
    );
  }

  if (resolution.data.type === "group") {
    // /<orgSlug>/<groupSlug>/<linkSlug> - Group feedback link
    return handleGroupFeedbackLink(
      orgSlug,
      secondSegment,
      linkSlug,
      resolution.data.groupId,
      resolution.data.organizationId,
    );
  }

  notFound();
}

async function handleOrgUserFeedbackLink(
  orgSlug: string,
  userSlug: string,
  linkSlug: string,
  userId: string,
  organizationId: string,
): Promise<React.ReactNode> {
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
          Give Feedback to {link.user.firstName || userSlug}
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
        basePath={`/${orgSlug}/${userSlug}/${linkSlug}`}
      />
    </div>
  );
}

async function handleGroupFeedbackLink(
  orgSlug: string,
  groupSlug: string,
  linkSlug: string,
  groupId: string,
  _organizationId: string,
): Promise<React.ReactNode> {
  // Get the group for visibility check and header info
  const groupResult = await getGroupForPublicPage(groupId);

  if (!groupResult.success || !groupResult.data) {
    notFound();
  }

  const group = groupResult.data;

  // Get the feedback link
  const linkResult = await getGroupFeedbackLinkBySlug(linkSlug, groupId);

  if (!linkResult.success || !linkResult.data) {
    notFound();
  }

  const link = linkResult.data;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Give Feedback to {group.name}
        </h1>
        <p className="text-muted-foreground">{link.name}</p>
        <p className="text-sm text-muted-foreground mt-1">
          {group.organization.name}
        </p>
      </div>
      <FeedbackSubmissionForm
        link={link}
        basePath={`/${orgSlug}/${groupSlug}/${linkSlug}`}
      />
    </div>
  );
}
