import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getFeedbackLinkBySlug as _getFeedbackLinkBySlug,
  getGroupFeedbackLinkBySlug,
  getGroupForPublicPage,
  getMemberLevel,
  getOrgValues,
} from "@propsto/data/repos";
import type { FeedbackLinkWithRelations } from "@propsto/data/repos/feedback-link";
import { constServer } from "@propsto/constants/server";
import { Button } from "@propsto/ui/atoms/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@propsto/ui/atoms/card";
import { auth } from "@/server/auth.server";
import {
  feedbackRefusal,
  getFeedbackPolicy,
  showsRecipientLevel,
} from "@/lib/feedback-policy";
import { getOrgLayers } from "@/lib/org-layers";
import { FeedbackSubmissionForm } from "../_components/feedback-form";
import type { LinkRecipient } from "../resolve-target";

// Cached to dedupe between generateMetadata and page render
const getFeedbackLinkBySlug = cache(_getFeedbackLinkBySlug);

interface LinkTargetProps {
  recipient: LinkRecipient;
  recipientSlug: string;
  linkSlug: string;
  basePath: string;
}

export async function linkMetadata({
  recipient,
  recipientSlug,
  linkSlug,
  basePath,
}: LinkTargetProps): Promise<Metadata> {
  if (recipient.type === "user") {
    const linkResult = await getFeedbackLinkBySlug(
      linkSlug,
      recipient.userId,
      recipient.organizationId,
    );
    if (linkResult.success && linkResult.data) {
      const name = linkResult.data.user?.firstName ?? recipientSlug;
      if (!recipient.organizationId) {
        return {
          title: `${linkResult.data.name} - ${name} | props.to`,
          description: `Give feedback to ${name}: ${linkResult.data.name}`,
        };
      }
      // basePath is /<orgSlug>/<userSlug>/<linkSlug>
      const orgName =
        linkResult.data.organization?.name ?? basePath.split("/")[1];
      return {
        title: `${linkResult.data.name} - ${name} | ${orgName}`,
        description: `Give feedback to ${name} via ${orgName}`,
      };
    }
  }
  return { title: `Feedback | props.to` };
}

/**
 * A feedback link addressed to a person or a team:
 * - /<username>/<linkSlug>: personal link
 * - /<orgSlug>/<userSlug>/<linkSlug>: org user link
 * - /<orgSlug>/<groupSlug>/<linkSlug>: group link
 */
export async function linkPage(
  props: LinkTargetProps,
): Promise<React.ReactNode> {
  return props.recipient.type === "group"
    ? groupLink(props.recipient.groupId, props)
    : userLink(props.recipient.userId, props.recipient.organizationId, props);
}

async function userLink(
  userId: string,
  organizationId: string | null,
  { recipientSlug, linkSlug, basePath }: LinkTargetProps,
): Promise<React.ReactNode> {
  // Personal links have no organizationId; org links are scoped to the org
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
          Give Feedback to {link.user?.firstName || recipientSlug}
        </h1>
        <p className="text-muted-foreground">{link.name}</p>
        {organizationId && link.organization && (
          <p className="text-sm text-muted-foreground mt-1">
            via {link.organization.name}
          </p>
        )}
      </div>
      {/* The link's owner is the recipient on org user links, so their level applies */}
      {await gatedFeedbackForm(link, basePath, Boolean(organizationId))}
    </div>
  );
}

async function groupLink(
  groupId: string,
  { linkSlug, basePath }: LinkTargetProps,
): Promise<React.ReactNode> {
  // Get the group for visibility check and header info
  const groupResult = await getGroupForPublicPage(
    groupId,
    (await auth())?.user?.id,
  );

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
      {await gatedFeedbackForm(link, basePath)}
    </div>
  );
}

// The form, or the reason the org's settings refuse this viewer (members-only, disabled)
export async function gatedFeedbackForm(
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
  const layers = link.organizationId
    ? await getOrgLayers(link.organizationId)
    : null;
  // The org's values layer: no active rows, no picker
  const valuesResult =
    link.organizationId && layers?.values
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
    layers?.levels &&
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
      values={valuesResult?.success ? values : undefined}
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
