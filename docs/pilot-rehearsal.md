# Gate 5 rehearsal

The last unchecked release test in `.github/PILOT_READINESS.md`: the combined
scenario run on a preview with the seeded Acme and Globex orgs, before inviting
Cresteo. Run started 2026-11-08 on this PR's preview deployment.

## Cast (from `packages/data/seed.ts`, password `P4ssw0rd`)

| Persona          | User                   | Role                            |
| ---------------- | ---------------------- | ------------------------------- |
| Acme owner       | mike.ryan@example.com  | OWNER of Acme                   |
| Acme admin       | bob.jones@acme.com     | ADMIN of Acme                   |
| Dual member      | john.doe@acme.com      | MEMBER of Acme, ADMIN of Globex |
| Plain member     | jane.smith@acme.com    | MEMBER of Acme                  |
| Removal target   | rita.stone@acme.com    | MEMBER of Acme, org link + slug |
| Invite target    | dana.price@acme.com    | No org (acme.com address)       |
| Other-tenant org | carol.white@globex.com | OWNER of Globex                 |

## Scenarios

| #   | Scenario                                                                                     | Result   |
| --- | -------------------------------------------------------------------------------------------- | -------- |
| 1   | Tenant isolation: Carol (Globex owner) cannot read or write anything in Acme by URL/id       | **pass** |
| 2   | Dual member: John sees each org's links only in that org; switcher shows both                | **pass** |
| 3   | Plain member: Jane reaches the org landing page but no admin pages                           | **pass** |
| 4   | Removed member: Rita removed by an admin; org pages and /acme/rita.stone/... stop resolving  | **pass** |
| 5   | Wrong-account invite: Dana invited; accept attempt while signed in as Jane is refused        | **pass** |
| 6   | Fresh link: created through the UI, submitted to from outside, answers + email arrive        | **pass** |
| 7   | Moderation bypass: John cannot read his PENDING feedback by URL; visible only after approval | **pass** |
| 8   | Failed email send: action reports the failure instead of claiming success                    | **n/a**  |

## Run notes (2026-11-08, previews `app/auth.pr-166.props.build`, branch DB reseeded before the run)

1. All four Acme admin/member URLs returned "Page not found" for Carol; her own
   `/org/globex/admin/links` worked and listed only "Carol at Globex" — dual-member
   John's Acme link did not leak into Globex's admin page. Write-path isolation is
   covered by the gate 1 authorization E2E suite, green on this PR.
2. John's switcher showed Globex (admin) and Acme (member); `/org/acme/admin/*`
   bounced him to the member landing; the landing showed his level rubric, the
   group he leads, and only his Acme links.
3. Jane got the member landing; admin URLs redirected her back to it.
4. Removal (owner, Members page) showed "Member removed"; DB confirmed her org
   link paused, org-scoped slug deleted, memberships zero. Signed out,
   `/acme/rita.stone/rita-acme` 404s; signed in as Rita, `/org/acme` 404s and the
   switcher lists no organizations. Her personal account still works.
5. Jane opening Dana's invite link got the "Wrong Account" screen naming both
   addresses, with "Sign out and switch account" as the way out; the token
   survived the GET un-consumed (`acceptedAt` stayed null).
6. "Rehearsal Props" created from Quick Props via the UI; a signed-out visitor
   (name + email given) submitted; the detail page rendered the answer under its
   field label; the feedback email (subject naming the visitor, answer as
   preview) was in the outbox.
7. John's Received list hid both PENDING items; `/feedback/466` and `/feedback/467`
   404'd for him (and a non-numeric id 404s, no 500). After approve/reject in the
   moderation queue (DB: 466 APPROVED, 467 REJECTED), exactly the approved item
   appeared, and his notification email was written at approval time, not submit
   time. The rejected item never surfaced and sent no email.
8. Not exercisable on a preview: `EMAIL_PROVIDER=outbox` writes a DB row and
   cannot fail realistically. The send-result checks in the invite and feedback
   actions are the gate 2 fix; to see the failure path for real, revoke the
   Resend key in a throwaway environment.

Findings (cosmetic, non-blocking):

- The received list and detail header show "Anonymous" for a signed-out
  submitter who filled in their name; the DB stores `submitterName` and the
  email uses it. Display-only inconsistency.
- Member removal uses a native `window.confirm`
  (`admin/members/member-actions.tsx:71`) where sibling flows use app dialogs.
