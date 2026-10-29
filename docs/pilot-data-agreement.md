# Props.to pilot data agreement

**DRAFT for founder review. Not agreed with Juga yet.**

This page sets out who owns the feedback collected during the props.to pilot, what happens when an employee leaves, and what happens when the pilot ends. It applies to the pilot company, Juga (`jugacompany.com`).

Every statement marked **Fact** describes what the product does today (as of main on 2026-10-17). Every statement marked **Decision** is a proposal the founder needs to confirm or change before Juga signs.

## 1. Who owns feedback

- **Fact.** Each piece of feedback belongs to the personal account of the person who received it. The `Feedback.userId` column (the recipient) is required. The organization is an optional tag (`organizationId`). The company name, group name and the recipient's role at the time are copied into the feedback record, so the record still reads correctly if the org or group is later deleted.
- **Fact.** Only two people can open a piece of feedback: the recipient (once it is approved) and the signed-in sender who wrote it. There is no screen where a company admin can read approved feedback addressed to employees.
- **Fact.** When moderation is on for an org (the default), company OWNERs and ADMINs see the text of pending feedback in the moderation queue so they can approve or reject it. A moderator never sees pending feedback addressed to themselves. Rejected feedback stays in the database and the recipient never sees it.
- **Fact.** When feedback becomes visible to the recipient (on submit when moderation is off, on approval when it is on), the product emails the recipient's account email. For non-anonymous feedback that email carries the first 200 characters of the first text answer and the sender's name. For pilot users the account email is the work address, so a copy of that text lands in, and is kept by, the company's mail system. Anonymous feedback emails carry no text and no sender.
- **Fact.** Anonymous feedback stores no sender account, name or email. The product does not record IP addresses with feedback or audit entries.
- **Decision.** Proposed wording for Juga: "Feedback is the employee's personal record. The company can moderate feedback given through its links, but it does not own or export approved feedback. Notification emails to the employee's work address include a short preview of the feedback and the sender's name, so the company's mail system holds a copy of that preview." Confirm this is acceptable to Juga.
- **Decision.** Should the notification email drop the feedback preview and sender name for org feedback during the pilot, so no feedback text reaches company mail? That would let the wording above say the company keeps no copy. Today the preview is sent.

## 2. When an employee leaves

What happens today when an admin removes a member from the org (Members page):

- **Fact.** Their org membership, org-scoped username (the org URL `/<org>/<user>` stops working) and group memberships are removed.
- **Fact.** Their org feedback links are paused, not deleted. Links the company set up for everyone ("managed links") move to the admin who removed them. A removed member cannot resume, pause or delete org links.
- **Fact.** All feedback they already received, including feedback received through the company's links, stays on their personal account and they can still read it. It is not deleted or handed to the company.
- **Fact.** Feedback still awaiting moderation when they leave stays pending. Company moderators can still approve or reject it.
- **Fact.** Approving it after they leave still sends the notification email, with the preview and sender name, to their old work address. That mailbox is often disabled or forwarded to a manager.
- **Fact.** Removal is recorded in the org audit log (`MEMBER_REMOVED`) with who did it and when.
- **Fact.** Their props.to account stays open. If they only ever signed in with their work Google account, they lose access once the company disables that account. A password or passkey still works. A personal email can be saved during onboarding, but sign-in does not use it yet.
- **Decision.** Should pending feedback for a departed employee be approved, rejected or left alone by default? Today it is left to the moderators.
- **Decision.** Should employees be told to set a password before they leave so they keep access to their feedback? Or is losing access with the work account acceptable for the pilot?

## 3. When the pilot ends

- **Fact.** The product has no way for a company or a user to delete an organization, delete an account or export data. Self-service deletion and export are deferred (see `.github/PILOT_READINESS.md`). Anything below is done by the founder by hand.
- **Fact.** If the founder deletes an organization with the existing repo function (`deleteOrganization`), the following are deleted with it: memberships, settings, invites, categories, audit log and the org's slugs. Feedback stays on each recipient's personal account, with the org tag cleared and the company name kept in the snapshot. Org links lose their org tag and become personal links of their owners, so any still active would then show on the owner's public profile; pause them first. Today this delete fails while the org still has groups, so groups have to be removed first.
- **Fact.** A user account that has received feedback cannot be deleted. The database blocks it (`Feedback_userId` foreign key is `RESTRICT`). Deleting a person's data means deleting their feedback first, by hand.
- **Decision.** Default at pilot end: (a) keep everything running, (b) delete the org and leave employees' personal accounts and feedback in place, or (c) delete the org and every account created for the pilot, including feedback. The schema is built for (b). Confirm with Juga.
- **Decision.** Notice period and deadline: how long before deletion users are told, and how many days after the pilot ends the data is gone.
- **Decision.** Whether users get an export before deletion. There is no export feature, so it would be a manual dump per person.
- **Decision.** Where the data lives (hosting provider and region), backup retention, and who is the contact for data requests. Fill in the real values before sending this.

## Sign-off

| Party              | Name | Date |
| ------------------ | ---- | ---- |
| props.to (founder) |      |      |
| Juga               |      |      |
