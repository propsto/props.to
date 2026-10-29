# Pilot launch guide: what's left for the founder

Written 2026-10-17, after gates 1–5 of `.github/PILOT_READINESS.md` were merged. The code side of the plan is done. What is left needs your accounts, your decisions, or the pilot company. Two items at the top (1 and 2) are new: they turned up while preparing this guide and they block the pilot.

Do them in order. Steps 1–4 are configuration (about an hour in total), step 5 is the first real test, and steps 6–9 can run in parallel with Juga's paperwork.

---

## 1. Remove the seed accounts from production (blocking, new)

**Done 2026-10-26.** All seed users, orgs, links, feedback and slugs were deleted in one checked transaction; the 5 global templates, 20 fields and 2 categories were kept, and "Migrate Production Database" re-ran the bootstrap successfully. The seed login is refused on auth.props.to. A full `pg_dump` from before the wipe is in the session scratchpad.

**Why.** Production still holds the five seed users from September (`mike.ryan@example.com`, `bob.jones@acme.com`, `john.doe@acme.com`, `jane.smith@acme.com`, `carol.white@globex.com`), the orgs "Acme Inc." and "Globex Corp." and 2 feedback rows. Every seed user has the password `P4ssw0rd`, which is public in `packages/data/seed.ts`. Anyone can sign in at auth.props.to as Mike, the owner of Acme. Nothing real is in there yet, so wiping it costs nothing. Once pilot users arrive it would be a real breach.

**Steps.**

1. Tell Claude: "wipe the seed data from production". It will delete those users, orgs and feedback, and keep the global templates and categories, re-created by `db-bootstrap`. Or do it yourself with the SQL below.
2. Check that https://auth.props.to no longer accepts `mike.ryan@example.com` / `P4ssw0rd`.

If you do it by hand, connect to the production branch (`main`, endpoint `ep-cool-shape-95300934`) in the Neon SQL editor and run:

```sql
BEGIN;
DELETE FROM "Organization" WHERE name IN ('Acme Inc.', 'Globex Corp.');
DELETE FROM "User" WHERE email IN ('mike.ryan@example.com','bob.jones@acme.com','john.doe@acme.com','jane.smith@acme.com','carol.white@globex.com');
SELECT count(*) FROM "User";   -- expect 0
COMMIT;
```

If a delete fails on a foreign key, the transaction rolls back and nothing changes; hand it to Claude instead.

Then re-run the template bootstrap so the global templates are intact. Start it from the Actions tab: "Migrate Production Database", then "Run workflow". It runs migrations and then `db-bootstrap`.

## 2. Fix the sender address for production app email (blocking, new)

**Done 2026-10-26 (option A).** Confirmed first with Resend's test inbox: the old app setup was rejected (`550 The props.to domain is not verified`) and the Resend API from `hello@comm.props.to` was accepted. The app project's `EMAIL_FROM` is now `hello@comm.props.to` and it has its own Production `RESEND_API_KEY`; app production was redeployed. The first real invite or notification email, in step 5, is the final check.

**Why.** Two different things send email in production:

- `auth` (magic links, personal-email verification) sends through the Resend API from `hello@comm.props.to`. That domain is verified in Resend, so this works.
- `app` (org invites, "you got feedback" notifications, moderation approvals) has no `RESEND_API_KEY`. It falls back to SMTP (`smtp.resend.com`) from `noreply@props.to`, using a Resend key whose account has **no verified domains**. Resend rejects mail from unverified domains, so invites and notifications from production most likely fail today. The app does report the failure; it no longer claims success.

**Steps (option A, quickest: reuse the verified domain).**

1. Vercel → project **app** → Settings → Environment Variables.
2. Change `EMAIL_FROM` (Production) to `hello@comm.props.to`, the same sender auth uses.
3. Add `RESEND_API_KEY` (Production only), with the same value auth has. Copy it from project **auth** → Environment Variables → `RESEND_API_KEY` → reveal.
4. Redeploy app: Deployments → latest production → ⋯ → Redeploy.
5. Test: once step 5 below gives you an org, invite your own personal address from Org admin → Members. The email should arrive.

**Option B (keep `noreply@props.to`).** In Resend → Domains → Add `props.to`, add the DNS records it shows (SPF, DKIM, and optionally DMARC) at your DNS provider, and wait for "Verified". Then do steps 1, 3 and 4 above without changing `EMAIL_FROM`.

Claude can do option A for you. Say "do option A".

## 3. Google sign-in: choose testing mode

**Why.** Pilot companies sign in with Google. On first login, props.to asks Google's Admin Directory API whether the person is a Workspace **super admin**. That's how an admin gets to create their company's org, and how everyone else auto-joins it. That check needs the `admin.directory.user.readonly` scope. Publishing an app that requests it to the general public needs Google's verification review: privacy policy, demo video, domain checks, usually weeks. "Testing" mode skips the review but only lets in people you list, up to 100. For one pilot company, testing mode is the right call. Every pilot user will see a "Google hasn't verified this app" screen once and click Continue; tell them in advance. Testing mode also expires Google refresh tokens after 7 days. props.to only uses Google at sign-in, so that doesn't affect it.

**Steps.**

1. https://console.cloud.google.com → pick the project that owns the OAuth client in Vercel's `GOOGLE_CLIENT_ID`.
2. APIs & Services → Library → search "Admin SDK API" → **Enable**. Without it the admin check silently fails and nobody can create an org.
3. Google Auth Platform (formerly "OAuth consent screen") → **Audience**: user type **External**, publishing status **Testing**.
4. Same page → **Test users** → add the work email of every pilot person: the Juga sponsor and every employee who should join. Anyone not on the list is refused by Google.
5. Google Auth Platform → **Clients** → your web client → **Authorized redirect URIs** must include:

```
https://auth.props.to/api/auth/callback/google
```

6. **Data access**: check that the scopes listed are `openid`, `email`, `profile` and `.../auth/admin.directory.user.readonly`.

## 4. Allow the pilot domain

**Done 2026-10-26.** The pilot is down to one company, `jugacompany.com`. The team-level `GOOGLE_ALLOWED_HOSTED_DOMAINS` is now `props.to,jugacompany.com` (all environments) and auth production was redeployed. Steps 3, 6, 8 and 9, the data agreement and `.github/PILOT_READINESS.md` now say Juga.

**Why.** `GOOGLE_ALLOWED_HOSTED_DOMAINS` is the server-side gate on which Google Workspace domains may sign in at all. It is currently set team-wide to `props.to` only (the readiness plan said "empty", which was wrong). So Juga employees would be turned away even after step 3.

**Steps.**

1. Vercel → Team Settings → Environment Variables → `GOOGLE_ALLOWED_HOSTED_DOMAINS`.
2. Set it to a comma-separated list. Keep `props.to` so you can test with your own Workspace:

```
props.to,jugacompany.com
```

3. Redeploy **auth**. The variable is read when the server starts.

## 5. Walk the real Google flows on production, with your own Workspace first

**Why.** Google login can't be tested on PR previews: each `auth.pr-N.props.build` would need its own redirect URI in Google. The E2E suite covers everything except Google itself. So the first real run of "admin creates org, employee auto-joins" should happen on production with your props.to Workspace, before any pilot company sees it.

**Steps.**

1. Sign in at https://auth.props.to with Google as a **super admin** of the props.to Workspace (and listed as a test user). Onboarding should offer to create the "props.to" org. Create it.
2. In a private window, sign in with a second, **non-admin** props.to Workspace account (also a test user). It should auto-join the props.to org. If you have no second account, create a free test user in admin.google.com.
3. During onboarding, add a personal email when asked. The verification email should arrive from `hello@comm.props.to`; this ticks the "personal-email verification" item.
4. As the admin: create an org link from a template, copy it, submit feedback to it from the second account, approve it in Org admin → Moderation, and check that the recipient gets the email (that tests step 2).
5. If anything fails, note the time and tell Claude. Logs are in Vercel → auth/app → Logs.

## 6. Confirm the Juga sponsor is a Workspace super admin

**Why.** Only a Google Workspace **super admin** (`isAdmin` in the Directory API, not a delegated admin) is offered org creation. If the sponsor isn't one, Juga gets no org and every employee lands on "wait for an admin".

**Steps.**

1. Ask the sponsor: "Can you open https://admin.google.com and see Account → Admin roles → Super Admin assigned to you?"
2. If yes, they sign in first, before any employee, and create the org.
3. If no, either their IT admin does the first sign-in and then promotes the sponsor to Owner from the Members page, or ask Claude to "write a script to provision an org with a given owner". About 30 minutes of work; it doesn't exist yet.

## 7. Turn on error reporting (Sentry)

**Why.** Errors in production currently go nowhere: the logger is silent without `DEBUG`, and `DEBUG` would log tokens. Sentry is wired in and strips cookies, auth headers, bodies and token-bearing URLs, but it stays off until it has a DSN. You want this on before strangers use the app.

**Steps.**

1. https://sentry.io → create a project, platform **Next.js** (free tier is enough). Copy the DSN.
2. Vercel → projects **app** and **auth** (both) → Environment Variables → add, target Production (and Preview if you want preview errors):

```
SENTRY_DSN=<the DSN>
NEXT_PUBLIC_SENTRY_DSN=<the DSN>
```

3. Redeploy both. `NEXT_PUBLIC_` values are baked in at build time.
4. Optional: stack traces will be minified. Readable ones need source-map upload with `SENTRY_AUTH_TOKEN`; ask Claude when you want it.

## 8. Settle the data agreement

**Why.** Juga needs to know who owns feedback about their employees, what happens when someone leaves, and what happens when the pilot ends. The draft in `docs/pilot-data-agreement.md` separates what the product does (Facts, checked against the code) from what you must decide. The pilot can't start until Juga accepts it.

**Decisions to make** (each is a marked "Decision" in the draft):

1. Accept the proposed ownership wording: feedback is the employee's personal record, and the company can moderate but doesn't own it.
2. Whether org-feedback notification emails should drop the text preview and sender name during the pilot, so no feedback text lands in company mail. Today the preview is included. Dropping it is a small code change Claude can make.
3. What to do with a departed employee's pending feedback (approve, reject, leave to moderators).
4. Whether to tell employees to set a password, so they keep access to their feedback after losing the work account.
5. Pilot-end default: (a) keep running, (b) delete the org and keep personal accounts (what the schema is built for), (c) delete everything.
6. Notice period and deletion deadline.
7. Whether people get an export. No export feature exists; it would be a manual dump.
8. Fill in the hosting facts: Vercel and Neon, region `us-east-2` (AWS), backup retention per your Neon plan, and a contact email for data requests.

**Steps.** Edit the draft, remove the Fact/Decision labels once settled, send it to the Juga sponsor, then tick the item in `.github/PILOT_READINESS.md`.

## 9. Final rehearsal

**Why.** It's the last gate: one pass through every edge case with real people roles before inviting Juga. It still means two orgs (your props.to org will sit next to Juga's in production), a person in both, a plain member, a removed member, a wrong-account invite, a fresh link, a moderation bypass attempt, and a failed email send.

**Steps.** Almost all of it can run on a PR preview with the seeded password users, and Claude can run that part. Say "run the gate 5 rehearsal on a preview". Only the Google-specific part needs you, and step 5 covers it. Tick the item when both are done.

---

## Housekeeping (5 minutes, not blocking)

- Delete your old local branch. It was merged via #108:

```
git branch -D fix/pilot-gate-2-reproducible-deployment
```

- The Neon CLI login on this machine expired. Re-auth if you use `neonctl`:

```
neonctl auth
```

- Optional: during an earlier session, the first 12 characters of the production database password were printed in local session output. It never left this machine. If you want to rotate it: Neon → project → Roles → `leog` → Reset password, then update `PGPASSWORD` and both production `DATABASE_URL`s (app and auth) in Vercel together and redeploy. Claude can do it end to end.

## After all of this

Invite Juga (gate 4 says not before), then watch Sentry and the moderation queues for the first week.
