# Pilot readiness plan

Goal: run a controlled friends-and-family pilot with two companies (the founder's employer and a client).

This plan was produced from a code assessment on 2026-09-20 and then critiqued by two independent reviewers. The critiques changed the order: security and tenant isolation come first, the "lazy" fixes (default org feedback to approved, hide dead UI) were rejected, and several claims in the original assessment were corrected. Corrections are listed at the end.

Progress: gate 1 implemented on branch `fix/pilot-gate-1-identity-and-tenancy` (2026-09-20), pending E2E on the PR. Reviewed by Codex and Grok; their findings (client-writable primary email, org creation without Workspace-admin check, raw group payloads, unscoped managed-link template, JWT keyed on nested user instead of `sub`, no-password sign-in oracle, invite resend race, already-member path leaving the token live) are fixed on the same branch.

Work is organised in gates. A gate is done when every box in it is checked and its release test passes. Do not invite either company before gate 4.

## Gate 1: identity and tenant boundaries

Nothing here is optional. All of these are reachable by any signed-in user today.

- [x] JWT `update` trigger copies the client-supplied session user into the token (`apps/auth/src/server/auth.edge.ts:215`). Keep `sub` immutable and reload user and memberships from the DB on update.
- [x] Onboarding server actions never call `auth()`; `userId` and `isGoogleWorkspaceAdmin` come from the client (`apps/auth/src/server/welcome-stepper-action.ts`). Derive both from the session. Leave the pending-token account-link handler as is.
- [x] Group admin actions have no auth (`apps/app/src/app/(dashboard)/org/[orgSlug]/admin/groups/actions.ts`). Gate on `verifyOrgAdminAccess` and use the org id it returns.
- [x] Sibling admin actions verify `orgSlug` but mutate a caller-supplied id: invites revoke/resend (`admin/members/actions.ts`), templates (`admin/templates/actions.ts`), managed links (`admin/links/managed/actions.ts`). Bind every mutation to the authorized org id, as `admin/categories/actions.ts` already does.
- [x] Settings and slug actions authorize off the JWT (`admin/settings/actions.ts`, `slug-actions.ts`). Use `verifyOrgAdminAccess`.
- [x] Org admin links page lists links of anyone who is a member, not links that belong to the org (`packages/data/repos/feedback-link.ts` `getOrganizationMemberFeedbackLinks`). Filter on `organizationId`.
- [x] Public profile lists all of a user's links including org ones (`(public)/[...slug]/page.tsx`, `getUserFeedbackLinks`). Filter to personal links.
- [x] Invite accept (`apps/auth/src/app/(default)/invite/page.tsx`): compare `invite.email` to session email, accept on POST not GET, random token instead of cuid, accept and add-member in one transaction, rotate token on resend, allow re-invite after expiry or revoke (unique on org+email blocks it).
- [x] Delete `apps/auth/src/app/debug/page.tsx`.
- [x] Redirect allowlist uses `endsWith(PROPSTO_HOST)` without a dot (`auth.edge.ts:241`). Require `.` prefix.
- [x] Sign-in enumerates users ("No user found" vs "Wrong credentials"). One message.

Release test: admin of org A cannot read or write anything in org B by id. A member of both orgs sees each org's links only in that org. Wrong-account invite accept is refused.

## Gate 2: reproducible deployment

- [ ] `migrate_production.yaml` has failed on all 12 runs since January 2026. Get the logs (re-run it manually), find the real cause, fix it.
- [ ] Migrations are split: `packages/data/migrations/` (real, 20 + lock) and `packages/data/prisma/migrations/` (2 orphans Prisma never reads). The invite migration only exists as an orphan. The default-template orphan duplicates DDL already in the real history, so delete it. Move the invite migration, then run `prisma migrate status` against a prod copy before deploying.
- [ ] Preview build swallows migration failures (`packages/data/scripts/seed-if-preview.cjs`). Fail loudly.
- [ ] Default templates only come from `seed.ts`, which starts with `deleteMany` on every table. Add an idempotent bootstrap for global templates that is safe to run on prod.
- [ ] `turbo.json` `globalEnv` is missing `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `OPENAI_API_KEY`, `NEXT_PUBLIC_AUTH_URL` (it lists a typo'd `PUBLIC_AUTH_URL`). Without them rate limiting silently no-ops on Vercel.
- [x] `packages/email/send/index.ts` reads `AUTH_RESEND_KEY`, which exists nowhere. Use `constServer.RESEND_API_KEY`. Then make invite and feedback actions check the send result instead of reporting success regardless.
- [ ] Error reporting: the logger is `debug`, silent without `DEBUG`. Add Sentry (or equivalent) to app and auth with redaction. Do not enable `DEBUG` globally: invite and auth logs include tokens and session data.

Release test: fresh database, `prisma migrate deploy`, bootstrap, app boots, invite table exists.

## Gate 3: one real journey, end to end

The personal loop does not work today for any link created through the UI.

- [ ] Public submit validates `linkId` as UUID but links are cuid (`(public)/[...slug]/actions.ts:68` vs `schema.prisma` FeedbackLink). Only seeded links can receive feedback. Fix the validator.
- [ ] Copy Link builds `https://props.to/f/<slug>` (`apps/app/src/app/_components/link-list.tsx:92`). No `/f` route exists. Build `/<user>/<slug>` or `/<org>/<user>/<slug>` on the app host. Same string in `links/adopt/adopt-managed-links.tsx`.
- [ ] Public form ignores the template (`(public)/[...slug]/_components/feedback-form.tsx`). Fetch `template.fields` in `getFeedbackLink`, render them, validate `fieldsData` server-side against the fields, and render answers with field labels on the detail page (it currently uses JSON keys and treats every number as a rating).
- [ ] Feedback-received email reads `fieldsData.feedback`, which template-driven forms will not set. Use the first long-text field or a generic body.
- [ ] Submit never sets `submitterId`, so signed-in submitters look anonymous and their Sent list stays empty. Set it from the session when present.
- [ ] Submit ignores `allowAnonymousFeedback`, external-feedback and org-enabled settings. Enforce them.
- [ ] Response-count increment is separate from create; `maxResponses` is racy. Do both in one transaction.
- [x] Invited newcomers cannot sign up: `signin-action.ts` returns "No user found" before the email provider runs. Let the magic link create the user.
- [ ] Onboarding completion redirects to app root and loses the invite destination. Carry `callbackUrl` through.
- [ ] Invite accept does not create the org-scoped slug, so the new member has no public org URL. Create it on accept.
- [ ] `feedback/[feedbackId]/page.tsx` does `BigInt(param)` unguarded (500 on bad input) and never checks status, so pending or rejected feedback is readable by URL.

Release test: new user receives an invite, signs up, lands in the org, creates a link from an org template, copies the URL, a second browser submits, the recipient sees the answers with labels and gets the email.

## Gate 4: operable for a company

- [ ] Moderation. Org submissions are always written `PENDING_MODERATION` and nothing approves them. `enableFeedbackModeration` defaults to true, so honoring the flag alone still strands everything. Build the minimal queue: org admin page listing pending, approve/reject using the existing repo functions, audit entry, notification email sent on approval rather than on submit. When moderation is off, honor `autoApproveInternalFeedback` for members and keep external pending.
- [ ] Link pause and delete are dead menu items (`_components/link-list.tsx:150`). `deactivateFeedbackLink` exists. Wire them. This is the only takedown control for a leaked link, so it is not optional.
- [ ] Members page: add remove member and change role. Removal must also deactivate the member's org links and remove the scoped slug.
- [ ] Non-admin members are redirected to `/org/[orgSlug]`, which does not exist. Add a member landing page (org templates, managed links, own org links).
- [ ] Account switcher renders member orgs as disabled items. Link them to the landing page.
- [ ] Received-feedback list fetches 50 with no paging. Add paging or a "load more".
- [ ] Audit log pagination buttons are permanently disabled (`admin/audit/audit-log-list.tsx`). Wire or remove.
- [ ] Write a one-page data agreement for both companies: who owns feedback, what happens when an employee leaves, what happens when the pilot ends. The schema keeps feedback on the personal account after org deletion; make sure that is what they agree to.

Release test: leaked link is paused within a minute from the UI. Removed member cannot reach org pages or their old org URL. Pending feedback is invisible to the recipient until approved.

## Gate 5: trim and rehearse

- [ ] Hide, do not build: `/settings`, `/reports`, goals (`/goals/new`, `/goals/[id]`, edit, delete), template detail, template edit, template duplicate and delete, link edit.
- [ ] Dashboard "recent feedback" renders only a count. Render the list or drop the card.
- [ ] Org landing at `/<org>` on the public site is stub text. Either a real page or a redirect.
- [ ] Rate limit is 10/min/IP on public submit. An office behind one NAT will hit it. Raise, or key on link+IP.
- [ ] Rehearsal with two orgs, one dual-member user, a plain member, a removed member, a wrong-account invite, a fresh link, a moderation bypass attempt, and a failed email send.

## Decide before gate 3

Org creation only happens in onboarding for Google Workspace admins who grant the Directory API scope. Email and password users, Microsoft users and non-admin Google users never see it and land on "wait for an admin". If either pilot company is not a Workspace tenant with a willing admin, there is no org at all. Options: provision the two orgs by script and make the sponsor OWNER, or add a plain "create organization" path. Provisioning by script is the smaller change and is enough for two companies.

## Deferred

Goals, reports, FeedbackRequest, payments, URI claims, security headers (CSP, HSTS), self-service account deletion and export, unit tests in CI beyond the authorization regression checks above, the Zoho early-access form, the duplicated AI form-generation code in `api/generate-form`.

## Git loose ends

- Invite work was committed directly to main by an agent while PR #107 with the same work is open and has a failing E2E run. Close #107.
- PR #106 (email-based identifiers, issue #27) is approved and unmerged. Decide after gate 3.
- Branches `feat/org-admin-dashboard` and `feat/org-member-visibility` are stale since January. Delete or rebase.

## Corrections to the original assessment

- Lockfile Prisma version claim was wrong. Lockfile and package.json both resolve 7.2.0.
- "Nothing is marked TODO" was wrong. Three unrelated TODOs exist.
- "All production email fails" is conditional on the Resend branch being selected, which happens only when `PROPSTO_ENV=production` and the key is set.
- "Every onboarding handler takes userId" was overbroad. The account-link handler uses a pending token.
- "Org feedback is never shown" was overstated. The detail page shows it by URL because it never checks status.
- "The personal loop works" was wrong. See gate 3.
- The migration workflow fix (swap config files) was a guess. Get the logs first.
