import type { Metadata } from "next";
import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { CheckCircle, Users } from "lucide-react";
import {
  resolveSlug as _resolveSlug,
  resolveOrgSlug as _resolveOrgSlug,
  resolveByEmail as _resolveByEmail,
  getEmailProfilePath,
  getFeedbackLinkBySlug as _getFeedbackLinkBySlug,
  getGroupFeedbackLinkBySlug,
  getEntityFeedbackLinkBySlug,
  getEntityForPublicPage,
  getUserFeedbackLinks,
  getUser as _getUser,
  getGroupForPublicPage,
  getOrganizationById,
  getOrganizationFeedbackLinks,
  getOrganizationSettings,
  getMemberLevel,
  getOrgValues,
  getUserOrganizationMembership,
} from "@propsto/data/repos";
import { checkRateLimit, EMAIL_LOOKUP_RATE_LIMIT } from "@propsto/data/utils";

// Cache expensive queries to dedupe between generateMetadata and page render
const resolveSlugBase = cache(_resolveSlug);
const resolveByEmail = cache(_resolveByEmail);
const resolveOrgSlug = cache(_resolveOrgSlug);
const getFeedbackLinkBySlug = cache(_getFeedbackLinkBySlug);
const getUser = cache(_getUser);

// Next.js keeps segments percent-encoded (an "@" arrives as "%40"), so decode
// them before matching usernames or emails. Malformed escapes stay as they are.
function decodeSegments(segments: string[] | undefined): string[] | undefined {
  return segments?.map(segment => {
    try {
      return decodeURIComponent(segment);
    } catch {
      return segment;
    }
  });
}

// Email detection regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Rate-limited slug resolution.
 * Email lookups are rate-limited to prevent enumeration attacks.
 */
const resolveSlug = cache(async function resolveSlugLimited(
  identifier: string,
): ReturnType<typeof resolveSlugBase> {
  // Only apply rate limiting for email lookups
  if (EMAIL_REGEX.test(identifier)) {
    // Get client IP for rate limiting
    const headersList = await headers();
    const forwardedFor = headersList.get("x-forwarded-for");
    const realIp = headersList.get("x-real-ip");
    const clientIp = forwardedFor?.split(",")[0]?.trim() ?? realIp ?? "unknown";

    const rateLimitKey = `email-lookup:${clientIp}`;
    const { allowed } = checkRateLimit(rateLimitKey, EMAIL_LOOKUP_RATE_LIMIT);

    if (!allowed) {
      // Rate limited - return null to show 404 (consistent response)
      return { success: true, data: null };
    }

    return resolveByEmail(identifier);
  }

  return resolveSlugBase(identifier);
});
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
import { auth } from "@/server/auth.server";
import { constServer } from "@propsto/constants/server";
import {
  feedbackRefusal,
  getFeedbackPolicy,
  showsRecipientLevel,
} from "@/lib/feedback-policy";
import { publicLinkPath } from "@/lib/public-link-path";
import type { FeedbackLinkWithRelations } from "@propsto/data/repos/feedback-link";
import { UserProfileHeader } from "./_components/user-profile-header";

interface PublicPageProps {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<{ context?: string | string[] }>;
}

// ?context= on entity links: what the visitor was looking at. Shown as plain
// text (React escapes it) and re-sanitized server-side on submit.
function readContext(raw: string | string[] | undefined): string | undefined {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value?.replace(/\s+/g, " ").trim().slice(0, 300) || undefined;
}

export async function generateMetadata({
  params,
}: PublicPageProps): Promise<Metadata> {
  const slug = decodeSegments((await params).slug);

  if (!slug || slug.length === 0) {
    return { title: "Not Found" };
  }

  // props.to/<email> only redirects; skip the lookup so it uses one
  // rate-limit slot (the page's), not two
  if (EMAIL_REGEX.test(slug[0])) {
    return { title: "props.to" };
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
        const name = linkResult.data.user?.firstName ?? slug[0];
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
        const name = linkResult.data.user?.firstName ?? slug[1];
        const orgName = linkResult.data.organization?.name ?? slug[0];
        return {
          title: `${linkResult.data.name} - ${name} | ${orgName}`,
          description: `Give feedback to ${name} via ${orgName}`,
        };
      }
    }
    if (orgUserResult.success && orgUserResult.data?.type === "entity") {
      const entity = await getEntityForPublicPage(orgUserResult.data.entityId);
      if (entity.success && entity.data) {
        return {
          title: `${entity.data.name} | ${entity.data.organization.name}`,
          description: `Give feedback on ${entity.data.name}`,
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
  searchParams,
}: PublicPageProps): Promise<React.ReactNode> {
  const slug = decodeSegments((await params).slug);

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
    // /<orgSlug>/<userSlug|groupSlug|entitySlug>/<linkSlug>
    const { context } = await searchParams;
    return handleThreeSegments(slug[0], slug[1], slug[2], readContext(context));
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

  // props.to/<email> is a shortcut: send it to the real address
  if (resolution.type === "user" && resolution.resolvedVia === "email") {
    const path = await getEmailProfilePath(resolution.userId, firstSegment);
    redirect(path.success && path.data ? path.data : `/${resolution.slug}`);
  }

  if (resolution.type === "user") {
    // Show user profile with their personal public feedback links (org links live under /<org>/<user>)
    const linksResult = await getUserFeedbackLinks(resolution.userId, {
      organizationId: null,
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
    return handleOrgPage(resolution.organizationId);
  }

  notFound();
}

async function handleOrgPage(organizationId: string): Promise<React.ReactNode> {
  const [orgResult, settings, session] = await Promise.all([
    getOrganizationById(organizationId),
    getOrganizationSettings(organizationId),
    auth(),
  ]);
  if (!orgResult.success || !orgResult.data) {
    notFound();
  }

  // Don't hand outsiders the staff directory when they can't give feedback anyway
  const enabled =
    settings.data?.feedbackSettings?.enableOrganizationFeedback ?? true;
  const membersOnly = !(
    settings.data?.defaultUserSettings?.allowExternalFeedback ?? false
  );
  const isMember =
    membersOnly && session?.user?.id
      ? Boolean(
          (
            await getUserOrganizationMembership({
              userId: session.user.id,
              organizationId,
            })
          ).data,
        )
      : false;
  const listLinks = enabled && (!membersOnly || isMember);

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

// The form, or the reason the org's settings refuse this viewer (members-only, disabled)
async function gatedFeedbackForm(
  link: FeedbackLinkWithRelations,
  basePath: string,
  // The link's owner is the recipient (org user links), so their level applies
  showRecipientLevel = false,
  // Entity links: what the visitor is giving feedback on
  context?: string,
): Promise<React.ReactNode> {
  const session = await auth();
  const policy = await getFeedbackPolicy(link, session?.user?.id);
  const refusal = feedbackRefusal(policy, link.visibility === "ANONYMOUS");
  if (refusal) {
    const signIn = `${constServer.AUTH_URL}/?callbackUrl=${encodeURIComponent(`${constServer.PROPSTO_APP_URL}${basePath}`)}`;
    return (
      <Card className="text-center">
        <CardHeader>
          <CardTitle>{refusal}</CardTitle>
        </CardHeader>
        {policy.enabled && !session?.user && (
          <CardContent>
            <Button asChild>
              <a href={signIn}>Sign in to continue</a>
            </Button>
          </CardContent>
        )}
      </Card>
    );
  }
  // The org's values layer: no rows, no picker
  const valuesResult = link.organizationId
    ? await getOrgValues(link.organizationId)
    : null;
  const values = valuesResult?.success
    ? valuesResult.data.map(({ id, name, description }) => ({
        id,
        name,
        description,
      }))
    : [];
  // The levels layer: expectations are internal, see showsRecipientLevel
  const levelResult =
    showRecipientLevel &&
    link.organizationId &&
    link.userId &&
    showsRecipientLevel(link, policy)
      ? await getMemberLevel(link.organizationId, link.userId)
      : null;
  const level = levelResult?.success ? levelResult.data : null;
  return (
    <FeedbackSubmissionForm
      link={{
        id: link.id,
        visibility: link.visibility,
        template: { fields: link.template.fields },
      }}
      basePath={basePath}
      allowAnonymous={policy.allowAnonymous}
      values={values}
      recipientLevel={
        level
          ? {
              name: level.name,
              summary: level.summary,
              expectations: Object.fromEntries(
                level.expectations.map(e => [e.valueId, e.text]),
              ),
            }
          : undefined
      }
      context={context}
    />
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
          Give Feedback to {link.user?.firstName || username}
        </h1>
        <p className="text-muted-foreground">{link.name}</p>
      </div>
      {await gatedFeedbackForm(link, `/${username}/${linkSlug}`)}
    </div>
  );
}

async function handleThreeSegments(
  orgSlug: string,
  secondSegment: string,
  linkSlug: string,
  context?: string,
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

  if (resolution.data.type === "entity") {
    // /<orgSlug>/<entitySlug>/<linkSlug> - Entity feedback link
    return handleEntityFeedbackLink(
      orgSlug,
      secondSegment,
      linkSlug,
      resolution.data.entityId,
      context,
    );
  }

  notFound();
}

async function handleEntityFeedbackLink(
  orgSlug: string,
  entitySlug: string,
  linkSlug: string,
  entityId: string,
  context?: string,
): Promise<React.ReactNode> {
  const [entityResult, linkResult] = await Promise.all([
    getEntityForPublicPage(entityId),
    getEntityFeedbackLinkBySlug(linkSlug, entityId),
  ]);
  if (!entityResult.data || !linkResult.data) {
    notFound();
  }
  const entity = entityResult.data;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Give feedback on {entity.name}
        </h1>
        {entity.description && (
          <p className="text-muted-foreground">{entity.description}</p>
        )}
        <p className="text-sm text-muted-foreground mt-1">
          {entity.organization.name}
        </p>
      </div>
      {await gatedFeedbackForm(
        linkResult.data,
        `/${orgSlug}/${entitySlug}/${linkSlug}`,
        false,
        context,
      )}
    </div>
  );
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
          Give Feedback to {link.user?.firstName || userSlug}
        </h1>
        <p className="text-muted-foreground">{link.name}</p>
        {link.organization && (
          <p className="text-sm text-muted-foreground mt-1">
            via {link.organization.name}
          </p>
        )}
      </div>
      {await gatedFeedbackForm(
        link,
        `/${orgSlug}/${userSlug}/${linkSlug}`,
        true,
      )}
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
      {await gatedFeedbackForm(link, `/${orgSlug}/${groupSlug}/${linkSlug}`)}
    </div>
  );
}
