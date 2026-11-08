# Team feedback plan: subgroups, team-recipient links, client feedback

Written 2026-11-08. Follows `docs/feedback-layers-plan.md`. Design reference is
a client-facing consultancy (the Cresteo pilot): an admin shapes a team as a
group (e.g. Infobase), subgroups per project (Symphony, Legacy Systems,
Reporting), and the client gives feedback to individuals in the team or to the
team as a whole. `/cresteo/infobase` lists members and subgroups;
`/cresteo/symphony` offers "give feedback to this team".

## What already exists (do not rebuild)

- Groups have org-scoped slugs, a public page at `/<org>/<groupSlug>` (name,
  description, members, group links), N admins via `GroupAdmin`, and a 2-level
  hierarchy via `Group.parentGroupId` enforced in `createGroup`/`updateGroup`.
- `/<org>/<groupSlug>/<linkSlug>` already resolves and renders "Give Feedback
  to {group}" with the gated form (`getGroupFeedbackLinkBySlug`).
- `createFeedbackLink` accepts `groupId`; `Feedback.groupId` exists as context;
  `getGroupFeedback` exists. The moderation queue and approve/reject already
  handle `userId NULL` rows (entities), and the submit action already has an
  entity recipient branch to mirror.
- Client-to-individual feedback is the existing `allowExternalFeedback` org
  setting; external submissions always wait for moderation.

## The actual gap

Feedback cannot be _addressed_ to a group: the DB check constraints
(`Feedback_person_xor_entity`, `FeedbackLink_person_xor_entity`) and
`createFeedback` validation force person XOR entity. A "group link" today still
carries a `userId`, so a team submission would land on one person's record —
exactly what the entities principle (#146) forbids.

## Principles

1. Team feedback never lands on an individual's record. Recipient is exactly
   one of person, entity, or group (`userId IS NULL AND entityId IS NULL AND
groupId IS NOT NULL` is the group case; `groupId` beside a `userId` stays
   what it is today: context).
2. Group links behave like entity links at the door: anyone may submit,
   outsiders always wait for moderation, members follow the org's
   auto-approve setting. Approved team feedback is shown to signed-in members
   of the org on the group's public page; outsiders see the form, not the
   feedback.
3. Reuse: leads = `GroupAdmin` (already plural), moderation queue as-is,
   the existing public resolver and gated form.

## PR G1: team-recipient feedback (size M)

- Migration `add_group_recipient_feedback`: replace both XOR constraints with
  one-recipient checks that admit the group case (person XOR entity XOR
  group-only). No column changes.
- `createFeedback`: validation becomes "exactly one recipient"; membership
  snapshot only for person recipients.
- Submit action: third recipient branch (`link.groupId` with no `userId`).
- `feedback-policy.ts`: group links take the entity branch (public door,
  moderated for outsiders).
- `deleteGroup` refuses when the group has team-recipient feedback or team
  links (mirrors values delete; `SetNull` would strand recipient-less rows).
- Moderation queue cards and approval email: render "To {group name}" for
  group rows (entity rows already render); on approval, notify the group's
  admins instead of a recipient person.
- Admin → Groups: a "Team link" action per group (org admin only) that creates
  the link with `groupId` and no `userId`.
- Group public page: an "approved team feedback" section visible to signed-in
  org members.
- Seed: a team link on Marketing; E2E: outsider submits to
  `/acme/marketing/<slug>` → pending → approve as Mike → visible to a member
  on the group page, absent from every member's Received list; member
  submission auto-approves.

## PR G2: subgroup navigation (size S)

- `getGroupForPublicPage` includes children; the parent page lists subgroup
  cards linking to `/<org>/<childSlug>`, and a child shows a breadcrumb to its
  parent. Slugs stay flat (org-scoped namespace); nothing nests in the URL —
  `/<org>/<group>/<x>` stays reserved for links.
- Admin create/edit group dialogs already carry `parentGroupId`; verify and
  wire whatever is unexposed.
- Seed: a subgroup under Marketing; E2E: parent lists the subgroup, child
  page loads with breadcrumb.

## Out of scope

Client accounts or portals, per-team digests and aggregates, team feedback on
the org landing page, three or more hierarchy levels, reassigning feedback
when groups are restructured.
