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

| #   | Scenario                                                                                     | Result  |
| --- | -------------------------------------------------------------------------------------------- | ------- |
| 1   | Tenant isolation: Carol (Globex owner) cannot read or write anything in Acme by URL/id       | pending |
| 2   | Dual member: John sees each org's links only in that org; switcher shows both                | pending |
| 3   | Plain member: Jane reaches the org landing page but no admin pages                           | pending |
| 4   | Removed member: Rita removed by an admin; org pages and /acme/rita.stone/... stop resolving  | pending |
| 5   | Wrong-account invite: Dana invited; accept attempt while signed in as Jane is refused        | pending |
| 6   | Fresh link: created through the UI, submitted to from outside, answers + email arrive        | pending |
| 7   | Moderation bypass: John cannot read his PENDING feedback by URL; visible only after approval | pending |
| 8   | Failed email send: action reports the failure instead of claiming success                    | pending |

Results are filled in as the run progresses; anything not exercisable on a
preview is noted with the reason and where it is covered instead.
