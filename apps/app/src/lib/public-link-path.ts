import type { FeedbackLinkWithRelations } from "@propsto/data/repos/feedback-link";

// Public path of a link on the app host, as (public)/[...slug]/page.tsx resolves it:
// /<user>/<slug>, /<org>/<user>/<slug>, /<org>/<group>/<slug> or /<org>/<entity>/<slug>
export function publicLinkPath(link: FeedbackLinkWithRelations): string {
  const org = link.organization?.slug.slug;
  if (org && link.entity)
    return `/${org}/${link.entity.slug.slug}/${link.slug}`;
  // Every link without an entity has a person (DB check constraint)
  const userSlug = link.user?.slug.slug ?? "";
  if (!org) return `/${userSlug}/${link.slug}`;
  if (link.group) return `/${org}/${link.group.slug.slug}/${link.slug}`;
  const userOrgSlug = link.user?.organizationSlugs.find(
    s => s.scopedToOrgId === link.organizationId,
  )?.slug;
  // ponytail: a member without an org-scoped slug (pre-gate-3 invites) gets a path that 404s
  return `/${org}/${userOrgSlug ?? userSlug}/${link.slug}`;
}
