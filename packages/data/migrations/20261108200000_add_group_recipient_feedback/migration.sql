-- Feedback (and links) may now be addressed to a group: exactly one recipient.
-- A groupId beside a userId keeps today's meaning (context of a person's link);
-- the group is the recipient only when both userId and entityId are NULL.
ALTER TABLE "Feedback" DROP CONSTRAINT "Feedback_person_xor_entity";
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_one_recipient" CHECK (
  ("userId" IS NOT NULL AND "entityId" IS NULL) OR
  ("userId" IS NULL AND "entityId" IS NOT NULL) OR
  ("userId" IS NULL AND "entityId" IS NULL AND "groupId" IS NOT NULL)
);

ALTER TABLE "FeedbackLink" DROP CONSTRAINT "FeedbackLink_person_xor_entity";
ALTER TABLE "FeedbackLink" ADD CONSTRAINT "FeedbackLink_one_recipient" CHECK (
  ("userId" IS NOT NULL AND "entityId" IS NULL) OR
  ("userId" IS NULL AND "entityId" IS NOT NULL) OR
  ("userId" IS NULL AND "entityId" IS NULL AND "groupId" IS NOT NULL)
);
