# Feedback layers plan: values, levels, process

Written 2026-10-29. Follows `.github/PILOT_READINESS.md` (gates 1 to 5, code side done) and `docs/pilot-launch-guide.md` (founder side, partly done). Design reference is a client company's framework: a five-dimension code of conduct, four seniority categories each with a rubric, and a three-step escalation path. Test audiences for the MVP are the props.to Workspace org (internal, all layers) and jugacompany.com (pilot, whichever layers they want).

## Principles

1. A layer exists for an org when it has rows. No feature flags, no plan tiers. An org with zero values gets no value picker, an org with zero levels gets no rubric. Same pattern as org categories and org templates today.
2. Feedback stays the recipient's record. Internal notes are a separate field with narrower access, never a separate copy of the feedback.
3. Reuse what exists. Direct lead = `GroupAdmin` of a group the person is in. People/Ops = org `ADMIN`/`OWNER`. Evidence = existing `Feedback` rows. Expectation text sits beside the form, not inside it.
4. Every PR carries its migration, an idempotent bootstrap change if it seeds anything, and one E2E.
5. Generic names in code and UI: values, levels, conversations. Company-specific words are org content typed into the admin UI, not constants.

## Track 1: values layer

Every piece of feedback can be tagged with one or more org-defined values, and feedback can be listed by value.

PR V1, data and admin (size S)

- `OrgValue` (id, organizationId, name, description, order; unique on org+name) and `FeedbackValue` join (feedbackId, valueId).
- Repo functions in `packages/data/repos/org-value.ts`: list, create, update, reorder, delete (delete refuses when referenced).
- Admin page `/org/[orgSlug]/admin/values`, same shape as the categories page. Gated by `requireOrgAdmin`. Nav entry beside Categories.
- Audit actions `VALUE_CREATED`, `VALUE_UPDATED`, `VALUE_DELETED`.
- Bootstrap: nothing global. The seed gives Acme three demo values so E2E has data.
- E2E: admin creates, renames, reorders and deletes a value; delete refused once referenced can wait for V2.

PR V2, tagging and reading (size M)

- Public feedback form: when the link belongs to an org with values, render a value picker (checkbox group) above the template fields. Store in `FeedbackValue` in the same transaction as the feedback.
- Received list and detail page show value chips. Received list gets a `?value=` filter.
- Feedback-received email mentions the values.
- Remove the hard-coded "What values did they demonstrate?" SELECT from the Quick Props bootstrap definition: the picker now covers it. Bootstrap only creates fields with new templates, so stored answers stay intact.
- E2E: org with values shows picker, tag persists, filter works; org without values shows no picker.

## Track 2: levels layer

Each member has a level, each level has a rubric, and each value has an expectation text per level. The form shows the recipient's level expectation beside the value being tagged.

PR L1, data and assignment (size M)

- `OrgLevel` (id, organizationId, name, order, summary, rubric Json). Rubric is an ordered list of `{title, body}` sections so any number of rubric rows fits.
- `OrgLevelValueExpectation` (levelId, valueId, text; composite id). Only meaningful when both layers are present.
- `OrganizationMember.levelId` nullable, `onDelete: SetNull`.
- `Feedback.recipientLevelName` snapshot string, set at submit from the recipient's membership.
- Admin page `/org/[orgSlug]/admin/levels`: list, create, reorder. Members page gets a level select per row, audit `MEMBER_LEVEL_CHANGED`.
- Seed: Acme gets three demo levels and one member assigned.
- E2E: create level, assign to member, member row shows it.

PR L2, rubric editor and matrix (size M)

- Level detail page: edit summary and rubric sections, and the per-value expectation grid (rows = values, one textarea each). Plain textareas, no rich editor.
- Member landing page `/org/[orgSlug]` shows the member their own level and rubric.
- Public feedback form, org links only: a collapsible "What we expect at this level" panel showing the recipient's level summary and, once a value is ticked, that value's expectation text. Only shown to signed-in org members; outsiders get the form without the panel.
- E2E: rubric shows on landing, expectation shows on form for a member, hidden for an outsider.

## Track 3: process layer (gated, see GATE above)

A lead can open a conversation about a member, with staged steps, a shared note the member sees, an internal note only lead and admins see, a review date, linked evidence, and admin notification from step 2 on.

PR P1, data and access (size M)

- `Conversation` (id, organizationId, subjectUserId, openedById, status OPEN/RESOLVED/CLOSED, valueId nullable, levelNameSnapshot, createdAt, resolvedAt).
- `ConversationStep` (id, conversationId, stage DIRECT/REPEATED/FINAL, ownerId, sharedNote, internalNote nullable, reviewAt nullable, consequence nullable, createdAt).
- `Feedback.conversationId` nullable: a feedback row can be attached as evidence.
- Access helper `apps/app/src/server/conversation-access.ts`: subject reads shared fields only; lead (group admin of any group the subject is in) and org admins read everything; only leads and admins write; only admins may create a FINAL step.
- Audit actions `CONVERSATION_OPENED`, `CONVERSATION_STEP_ADDED`, `CONVERSATION_RESOLVED`.
- Unit tests for the access helper.

PR P2, UI and notifications (size L)

- Lead view at `/org/[orgSlug]/people/[memberSlug]/conversations` (lead or admin only): list, open, add step, attach existing feedback, resolve.
- Subject view: a "Conversations" nav entry visible only when the user is subject of at least one. Shows stage, shared note, review date, consequence. Never the internal note.
- Email on REPEATED and FINAL step creation to org admins, linking to the conversation. Email to the subject when a step is added, shared fields only, no note text in the mail body.
- Bootstrap template "Direct feedback" (global, feedbackType MANAGER_FEEDBACK) with fields Fact, Date, Impact, Adjustment needed.
- E2E: lead opens, subject sees shared note only, admin gets outbox mail on step 2, a non-lead member gets 404.

## Out of scope

Reports and aggregates per value or level, self-assessment against the rubric, promotion workflows, FeedbackRequest, anything in the readiness plan's Deferred list, and every founder-side launch item.
