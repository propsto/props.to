import type { FeedbackLinkWithRelations } from "@propsto/data/repos/feedback-link";

// Public path of a link on the app host, as (public)/[...slug]/page.tsx resolves it:
// /<user>/<slug>, /<org>/<user>/<slug> or /<org>/<group>/<slug>
export function publicLinkPath(link: FeedbackLinkWithRelations): string {
  if (!link.organization) return `/${link.user.slug.slug}/${link.slug}`;
  const org = link.organization.slug.slug;
  if (link.group) return `/${org}/${link.group.slug.slug}/${link.slug}`;
  const userOrgSlug = link.user.organizationSlugs.find(
    s => s.scopedToOrgId === link.organizationId,
  )?.slug;
  // ponytail: a member without an org-scoped slug (pre-gate-3 invites) gets a path that 404s
  return `/${org}/${userOrgSlug ?? link.user.slug.slug}/${link.slug}`;
}
