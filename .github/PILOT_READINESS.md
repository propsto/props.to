# Pilot readiness plan

Goal: run a controlled friends-and-family pilot with one company, Juga (`jugacompany.com`). It was planned for two companies (the founder's employer and a client) and narrowed to one on 2026-10-26.

This plan was produced from a code assessment on 2026-09-20 and then critiqued by two independent reviewers. The critiques changed the order: security and tenant isolation come first, the "lazy" fixes (default org feedback to approved, hide dead UI) were rejected, and several claims in the original assessment were corrected. Corrections are listed at the end.

Progress: gate 1 implemented on branch `fix/pilot-gate-1-identity-and-tenancy` (2026-09-20), pending E2E on the PR. Reviewed by Codex and Grok; their findings (client-writable primary email, org creation without Workspace-admin check, raw group payloads, unscoped managed-link template, JWT keyed on nested user instead of `sub`, no-password sign-in oracle, invite resend race, already-member path leaving the token live) are fixed on the same branch.

Work is organised in gates. A gate is done when every box in it is checked and its release test passes. Do not invite Juga before gate 4.

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

## Gate 1 addendum: admin pages leaked another org's data (found by the release test)

Building the two-tenant test surfaced a real leak the action/repo fixes did not cover. The org admin pages fetched org data relying only on the admin layout's `notFound()`, which in the App Router does not stop a child page from rendering, so any signed-in user could read another org's admin data by URL. Confirmed on the preview: a non-member of Globex received "Carol at Globex" in the links page.

- [x] Add `apps/app/src/server/require-org-admin.ts` and call it at the top of every admin page that fetches org data, before any query. Members and audit pages already checked membership themselves. Verified on the preview: a non-member now gets no org data on links, templates, categories, settings or groups, while the owner still sees their own org. (The HTTP status is still 200 rather than 404 in the streaming case; the data no longer leaks, which is the security fix. Returning 404 is a cosmetic follow-up.)

## Preview mail (answers "how do we read emails from previews")

Preview and test deploys run with `EMAIL_PROVIDER=outbox`: every email, including Auth.js magic links, is stored in the `EmailOutbox` table instead of sent, and read back via `GET /api/preview-mail?to=<addr>` on the app or auth (session required, 404 on non-preview). Local dev still uses MailDev; production uses Resend. The intent was that the three previews (app, auth, web) share one Neon branch per git branch, so the outbox is a single shared mailbox. As of 2026-09-27 only `auth` actually gets a per-branch database; see the first gate 2 item.

Known preview flakiness: the seed runs a destructive `deleteMany` on every build, and app/auth/web build separately, so preview data can be wiped mid-test. This is the gate 2 idempotent-seed item; it makes the invite E2E occasionally flaky but is not a product bug (the invite logic was verified directly against the DB).

## Focus: Google Workspace organizations

The pilot targets Google Workspace companies. Admins create their org on first Google login (Workspace-admin detected via the Directory API), employees auto-join their domain's org on first login, and everyone returns via Google on later logins. This makes gate 1's "only a Workspace admin can create an org for their verified domain" the intended behavior, not a limitation. Email invites are a secondary path for non-Workspace people.

Google Workspace pilot checklist (new):

- [ ] Google Cloud OAuth: decide testing mode (add pilot users as test users, avoids verifying the sensitive `admin.directory.user.readonly` scope) vs full verification.
- [x] Set `GOOGLE_ALLOWED_HOSTED_DOMAINS` to the pilot company domain. Done 2026-10-26: the team-level var is `props.to,jugacompany.com` in every environment (`props.to` stays for the founder's own tests); auth production redeployed.
- [x] Hosted domains are normalized (trim + lowercase) at org creation, on every lookup and in the allowlist, so a mixed-case `hd` claim cannot miss its org or slip past the allowlist (commit `c02b2fc`).
- [ ] Confirm the Juga sponsor is an actual Workspace super admin, or provision the org's first owner by script.
- [ ] Walk the admin-creates-org and employee-auto-joins flows on the preview (Google login is manual; password-seeded users stay a test convenience).
- [ ] Personal-email verification during onboarding sends via Resend in prod / outbox in preview (covered by the RESEND_API_KEY fix).

Release test run on the PR #108 preview (2026-09-20), signed in as the seeded owner of Acme: invite create, revoke, re-invite of the same address, resend; invite of an existing member refused; group create, add member, delete; add default template and set as default; managed link create with an org template; feedback settings save and restore; org links page shows org links only; public profile shows personal links only; `/debug` returns 404; bogus invite token rejected; no-password and wrong-password sign-in give identical responses for a seeded and an unknown email. Not runnable on the preview: the two-tenant and dual-member checks (the seed has one org and org creation needs a Workspace admin) and wrong-account invite accept (the token is only in the email). Run those on the first real second org, or locally with a seeded second org.

## Gate 2: reproducible deployment

- [x] **App preview builds wipe production (found 2026-09-27).** The `app` Vercel project has a single hand-set `DATABASE_URL` (created 2023-11) targeting production, preview and development, and no Neon integration. Every app preview build ran `seed-if-preview.cjs`, which `deleteMany`s every table, against the production branch `br-lively-thunder-28239235`; the PR #109 app preview did so at 14:58 UTC. Production currently holds only seed data (4 users on acme.com and example.com, 1 org), so nothing real was lost, but nothing real may enter production until this is fixed. It also means the #108 "release test on the preview" ran against production, the app E2E suite runs against production, and the "Dry-run Migration on Production Copy" check always finds nothing pending because app previews migrate production first. Only `auth` has the Neon integration with per-branch `DATABASE_URL` and `DATABASE_URL_UNPOOLED`; `web` has no `DATABASE_URL` in its project env yet its build reached a stale endpoint that belongs to no existing branch (a team-level shared var, most likely). Code-side guard in PR #109: the seed refuses to run unless `DATABASE_URL_UNPOOLED` is set, and `web` no longer depends on `@propsto/data`. Config fix, dashboard only: connect the `app` project to the Neon Vercel integration (per-branch preview databases, like `auth`), scope its hand-set `DATABASE_URL` to production only, and remove the stale shared database var from `web`. Then reseed nothing on production; run `db-bootstrap` only.
      Fixed operationally 2026-10-16: `app` gets per-branch Neon `DATABASE_URL(_UNPOOLED)` via `.github/workflows/app_preview_db.yaml` + `scripts/sync-app-preview-db.sh`, app/auth project `DATABASE_URL` is production-only, closed-PR Neon branches are deleted. Checked 2026-10-17: the `web` project has no `DATABASE_URL` in any target, but the team-level shared `DATABASE_URL` (one preview var, one production var, both last updated January 2025) is still linked to `web`, `app` and `auth`. Harmless for `web` (no `@propsto/data`), but it is the fallback for any app/auth preview without a project-level value; unlink it from all three in the dashboard. Done 2026-10-17: the shared `DATABASE_URL` vars were deleted (#119 made `web`'s build stop needing one).
- [x] `migrate_production.yaml` has failed on all 12 runs since January 2026. Logs and step results for every run have expired (GitHub returns 410), and runs older than 30 days cannot be re-run. Diagnosis by comparison: on 2026-03-22 the PR dry-run ran the identical command with identical setup against a Neon branch of production and passed minutes after the prod workflow failed. The only differing input is the hand-pasted `DATABASE_URL_PRODUCTION` secret (set 2026-01-24, never changed; a pooled or stale URI both break `migrate deploy`). Fix in the gate 2 PR: resolve the production URI from the Neon API at run time, exactly as the dry-run does, add `workflow_dispatch`, and run the template bootstrap after deploy. First real proof is the next run on main; delete the secret once it passes.
- [x] Migrations are split: `packages/data/migrations/` (real, 20 + lock) and `packages/data/prisma/migrations/` (2 orphans Prisma never reads). The invite migration only exists as an orphan. The default-template orphan duplicates DDL already in the real history, so delete it. Move the invite migration, then run `prisma migrate status` against a prod copy before deploying. Done in PR #108 after the preview proved every invite failed; the "Dry-run Migration on Production Copy" check passed, so prod does not have the table yet and the migration applies cleanly.
- [x] Preview build swallows migration failures (`packages/data/scripts/seed-if-preview.cjs`). Fail loudly. Gate 2 PR: migration failure exits 1; seed failure is still tolerated because app, auth and web seed the same branch concurrently and can collide.
- [x] Default templates only come from `seed.ts`, which starts with `deleteMany` on every table. Add an idempotent bootstrap for global templates that is safe to run on prod. Gate 2 PR: `packages/data/bootstrap.ts` upserts categories and templates by fixed id and only creates fields with a new template, so stored answers keep their field references. The seed calls it, `db-bootstrap` runs it standalone, the prod workflow runs it after deploy. The seed itself still wipes everything, so previews stay flaky until the seed is made idempotent too.
- [x] `turbo.json` `globalEnv` is missing `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `OPENAI_API_KEY`, `NEXT_PUBLIC_AUTH_URL` (it lists a typo'd `PUBLIC_AUTH_URL`). Without them rate limiting silently no-ops on Vercel. Fixed in the gate 2 PR.
- [x] `packages/email/send/index.ts` reads `AUTH_RESEND_KEY`, which exists nowhere. Use `constServer.RESEND_API_KEY`. Then make invite and feedback actions check the send result instead of reporting success regardless.
- [x] Error reporting: the logger is `debug`, silent without `DEBUG`. Add Sentry (or equivalent) to app and auth with redaction. Do not enable `DEBUG` globally: invite and auth logs include tokens and session data.
      Gate 2 error-reporting PR: `@sentry/nextjs` in app and auth via `instrumentation.ts` / `instrumentation-client.ts`, errors only (no tracing, no replay), shared redaction in `packages/logger/sentry.ts` (drops cookies, auth headers, request bodies, user info and any URL query string with token/code/callbackUrl, including breadcrumbs). Off until `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` are set; no build plugin, so no auth token and no source map upload.

Release test: fresh database, `prisma migrate deploy`, bootstrap, app boots, invite table exists.

## Gate 3: one real journey, end to end

The personal loop does not work today for any link created through the UI.

- [x] Public submit validates `linkId` as UUID but links are cuid (`(public)/[...slug]/actions.ts:68` vs `schema.prisma` FeedbackLink). Only seeded links can receive feedback. Fix the validator. Gate 3 PR: `z.string().cuid()`.
- [x] Copy Link builds `https://props.to/f/<slug>` (`apps/app/src/app/_components/link-list.tsx:92`). No `/f` route exists. Build `/<user>/<slug>` or `/<org>/<user>/<slug>` on the app host. Same string in `links/adopt/adopt-managed-links.tsx`. Gate 3 PR: the link include now carries the user, org-scoped user, org and group slugs; `apps/app/src/lib/public-link-path.ts` builds the path and Copy/Open use it on the current origin. The adopt dialog shows the real `/<org>/<you>/` prefix.
- [x] Public form ignores the template (`(public)/[...slug]/_components/feedback-form.tsx`). Fetch `template.fields` in `getFeedbackLink`, render them, validate `fieldsData` server-side against the fields, and render answers with field labels on the detail page (it currently uses JSON keys and treats every number as a rating). Gate 3 PR: the link include carries `template.fields`; the form renders every field type and keys answers by field id; `apps/app/src/lib/template-fields.ts` validates answers against the fields on submit (required, type, range, options; unknown keys dropped; unit-tested) and labels them on the detail page, falling back to the key for pre-template feedback keyed by label. Public and hidden-link E2E updated to the seeded Quick Props fields.
- [x] Feedback-received email reads `fieldsData.feedback`, which template-driven forms will not set. Use the first long-text field or a generic body. Gate 3 PR: preview is the first TEXTAREA answer, else the first TEXT answer, else the template's generic body.
- [x] Submit never sets `submitterId`, so signed-in submitters look anonymous and their Sent list stays empty. Set it from the session when present. Gate 3 PR: set from `auth()` on non-anonymous submissions; anonymous ones stay unlinked so the promise to the submitter holds in the database too.
- [x] Submit ignores `allowAnonymousFeedback`, external-feedback and org-enabled settings. Enforce them. Gate 3 PR: `apps/app/src/lib/feedback-policy.ts` reads the org's feedback and member settings (schema defaults when unset: feedback on, anonymous off, external off); the submit action refuses disabled orgs, non-members when external feedback is off, and anonymous submissions when not allowed. The public page shows the refusal with a sign-in link instead of the form, and hides the anonymous toggle when not allowed. Personal links are unaffected.
- [x] Response-count increment is separate from create; `maxResponses` is racy. Do both in one transaction. Gate 3 PR: `createFeedback` increments the link's count and creates the feedback in one transaction, and throws (rolling back) when the incremented count exceeds `maxResponses`; `incrementLinkResponseCount` removed.
- [x] Invited newcomers cannot sign up: `signin-action.ts` returns "No user found" before the email provider runs. Let the magic link create the user.
- [x] Onboarding completion redirects to app root and loses the invite destination. Carry `callbackUrl` through. Gate 3 PR: the stepper keeps the query string between steps and sends the user to `callbackUrl` on completion. The allowlist from the Auth.js `redirect` callback moved to `apps/auth/src/lib/callback-url.ts` (unit-tested) and now also guards the sign-in and welcome pages, which previously redirected to any `callbackUrl` (open redirect).
- [x] Invite accept does not create the org-scoped slug, so the new member has no public org URL. Create it on accept. Gate 3 PR: `acceptOrganizationInvite` creates the org-scoped slug from the email local part (via `generateUniqueSlug`) in the same transaction when the member has none, matching the domain-join path.
- [x] `feedback/[feedbackId]/page.tsx` does `BigInt(param)` unguarded (500 on bad input) and never checks status, so pending or rejected feedback is readable by URL. Gate 3 PR: non-numeric ids 404; the recipient only sees `APPROVED` feedback, the sender can still open what they submitted.

Release test: new user receives an invite, signs up, lands in the org, creates a link from an org template, copies the URL, a second browser submits, the recipient sees the answers with labels and gets the email.

## Gate 4: operable for a company

- [x] Moderation. Org submissions are always written `PENDING_MODERATION` and nothing approves them. `enableFeedbackModeration` defaults to true, so honoring the flag alone still strands everything. Build the minimal queue: org admin page listing pending, approve/reject using the existing repo functions, audit entry, notification email sent on approval rather than on submit. When moderation is off, honor `autoApproveInternalFeedback` for members and keep external pending. Done: `/org/[orgSlug]/admin/moderation` queue; approve/reject bound in the repo to the admin's org, pending status, and not the moderator's own feedback (an admin never sees or moderates feedback addressed to them; feedback to an org's only OWNER/ADMIN is approved at submit so it is never stranded); `FEEDBACK_APPROVED`/`FEEDBACK_REJECTED` audit actions; recipient email on approval only; `needsModeration` in `lib/feedback-policy.ts` decides the initial status; `e2e/app/tests/moderation.e2e.ts` covers hidden-until-approved, approve, reject and the outbox email.
- [x] Link pause and delete are dead menu items (`_components/link-list.tsx:150`). `deactivateFeedbackLink` exists. Wire them. This is the only takedown control for a leaked link, so it is not optional. Done: owner-only pause/resume/delete actions in `(dashboard)/links/actions.ts`; delete is hard (feedback kept, `linkId` set null) and the public URL 404s; `e2e/app/tests/link-takedown.e2e.ts` covers an already-open form being refused after pause.
- [x] Members page: add remove member and change role. Removal must also deactivate the member's org links and remove the scoped slug. Done: role select and remove button per row (`admin/members/member-actions.tsx`); actions bound to the admin's org, no acting on yourself, only an OWNER can touch an OWNER or grant OWNER, `MEMBER_ROLE_CHANGED`/`MEMBER_REMOVED` audit entries. The repo locks the org row and refuses any change that leaves zero OWNERs; removal also pauses the member's org links, deletes the org-scoped slug, and drops them from the org's groups. A removed member cannot resume, pause or delete an org link (membership check in `links/actions.ts`); managed links they authored pass to the removing admin. `e2e/app/tests/member-management.e2e.ts` covers role change, removal, and the old org URL 404ing.
- [x] Non-admin members are redirected to `/org/[orgSlug]`, which does not exist. Add a member landing page (org templates, managed links, own org links). Done: `org/[orgSlug]/page.tsx`, members only (non-members and removed members get 404).
- [x] Account switcher renders member orgs as disabled items. Link them to the landing page. Done: members link to `/org/<slug>`, admins still go to `/org/<slug>/admin`.
- [x] Received-feedback list fetches 50 with no paging. Add paging or a "load more". Done: `?page=` paging, 20 per page, via the shared `_components/pager.tsx`.
- [x] Audit log pagination buttons are permanently disabled (`admin/audit/audit-log-list.tsx`). Wire or remove. Done: they were already links past page 1 but nothing seeded enough entries to see it; moved to the shared pager, invalid `?page=` now falls back to 1, seed adds 25 acme entries, E2E pages through.
- [ ] Write a one-page data agreement for Juga: who owns feedback, what happens when an employee leaves, what happens when the pilot ends. The schema keeps feedback on the personal account after org deletion; make sure that is what they agree to. Draft written, needs founder sign-off: `docs/pilot-data-agreement.md` separates what the code does today from the decisions still open.

Release test: leaked link is paused within a minute from the UI. Removed member cannot reach org pages or their old org URL. Pending feedback is invisible to the recipient until approved.

## Gate 5: trim and rehearse

- [x] Hide, do not build: `/settings`, `/reports`, goals (`/goals/new`, `/goals/[id]`, edit, delete), template detail, template edit, template duplicate and delete, link edit. Done: nav entries, dashboard goal card, template card link/menu and link Edit item removed; `/goals` calls notFound(), the rest have no page and 404.
- [x] Dashboard "recent feedback" renders only a count. Render the list or drop the card. Done: last 5 approved items plus "View all N".
- [x] Org landing at `/<org>` on the public site is stub text. Either a real page or a redirect. Done: org name plus active, non-hidden member links (managed and group links left out); members-only or feedback-off orgs show outsiders the name only, and members without a PUBLIC profile are never listed.
- [x] Rate limit is 10/min/IP on public submit. An office behind one NAT will hit it. Raise, or key on link+IP. Done: 10/min per link+IP, 120/min per-IP ceiling.
- [ ] Rehearsal with two orgs, one dual-member user, a plain member, a removed member, a wrong-account invite, a fresh link, a moderation bypass attempt, and a failed email send. Still two orgs with one pilot company: production will hold the founder's props.to org next to Juga's, so tenant isolation has to hold. Run it on a preview with the seeded Acme and Globex.

## Decide before gate 3

Org creation only happens in onboarding for Google Workspace admins who grant the Directory API scope. Email and password users, Microsoft users and non-admin Google users never see it and land on "wait for an admin". If Juga is not a Workspace tenant with a willing admin, there is no org at all. Options: provision the org by script and make the sponsor OWNER, or add a plain "create organization" path. Provisioning by script is the smaller change and is enough for one company.

## Deferred

Goals, reports, FeedbackRequest, payments, URI claims, security headers (CSP, HSTS), self-service account deletion and export, unit tests in CI beyond the authorization regression checks above, the Zoho early-access form, the duplicated AI form-generation code in `api/generate-form`.

## Git loose ends

- ~~Invite work was committed directly to main by an agent while PR #107 with the same work is open and has a failing E2E run. Close #107.~~ Closed 2026-09-27.
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
