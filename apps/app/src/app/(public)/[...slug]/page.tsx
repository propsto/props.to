import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import {
  resolveSlug,
  resolveOrgSlug,
  getFeedbackLinkBySlug,
  getUserFeedbackLinks,
  getUser,
} from "@propsto/data/repos";
import { Button } from "@propsto/ui/atoms/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@propsto/ui/atoms/card";
import { FeedbackSubmissionForm } from "./_components/feedback-form";
import { UserProfileHeader } from "./_components/user-profile-header";

interface PublicPageProps {
  params: Promise<{ slug: string[] }>;
}

export async function generateMetadata({
  params,
}: PublicPageProps): Promise<Metadata> {
  const { slug } = await params;

  if (!slug || slug.length === 0) {
    return { title: "Not Found" };
  }

  // Thank you page
  if (slug[slug.length - 1] === "thanks") {
    return {
      title: "Thank You | props.to",
      description: "Your feedback has been submitted successfully.",
    };
  }

  // Profile page: /<username>
  if (slug.length === 1) {
    const slugResult = await resolveSlug(slug[0]);
    if (slugResult.success && slugResult.data?.type === "user") {
      const userResult = await getUser({ id: slugResult.data.userId });
      if (userResult.success && userResult.data) {
        const name = userResult.data.firstName ?? slug[0];
        return {
          title: `${name} | props.to`,
          description: `Give feedback to ${name} on props.to`,
        };
      }
    }
    return { title: `${slug[0]} | props.to` };
  }

  // Feedback link: /<username>/<linkSlug> or /<orgSlug>/<username>
  if (slug.length === 2) {
    const slugResult = await resolveSlug(slug[0]);
    if (slugResult.success && slugResult.data?.type === "user") {
      const linkResult = await getFeedbackLinkBySlug(
        slug[1],
        slugResult.data.userId,
        null,
      );
      if (linkResult.success && linkResult.data) {
        const name = linkResult.data.user.firstName ?? slug[0];
        return {
          title: `${linkResult.data.name} - ${name} | props.to`,
          description: `Give feedback to ${name}: ${linkResult.data.name}`,
        };
      }
    }
    return { title: `Feedback | props.to` };
  }

  // Org feedback link: /<orgSlug>/<username>/<linkSlug>
  if (slug.length === 3) {
    const orgUserResult = await resolveOrgSlug(slug[0], slug[1]);
    if (orgUserResult.success && orgUserResult.data?.type === "user") {
      const linkResult = await getFeedbackLinkBySlug(
        slug[2],
        orgUserResult.data.userId,
        orgUserResult.data.organizationId,
      );
      if (linkResult.success && linkResult.data) {
        const name = linkResult.data.user.firstName ?? slug[1];
        const orgName = linkResult.data.organization?.name ?? slug[0];
        return {
          title: `${linkResult.data.name} - ${name} | ${orgName}`,
          description: `Give feedback to ${name} via ${orgName}`,
        };
      }
    }
    return { title: `Feedback | props.to` };
  }

  return { title: "props.to" };
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
    // /<orgSlug>/<username>/<linkSlug>
    return handleOrgFeedbackLink(slug[0], slug[1], slug[2]);
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
    // /<orgSlug>/<username> - Org member profile
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
