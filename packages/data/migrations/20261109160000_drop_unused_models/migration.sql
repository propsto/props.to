-- Drop the models no code path uses (#184). Production row counts verified 2026-11-09:
-- Uri 0, UriClaim 0, Integration 0, Payment 0, FeedbackRequest 0. No rows are deleted.


-- DropForeignKey
ALTER TABLE "FeedbackRequest" DROP CONSTRAINT "FeedbackRequest_requesterId_fkey";

-- DropForeignKey
ALTER TABLE "FeedbackRequest" DROP CONSTRAINT "FeedbackRequest_recipientUserId_fkey";

-- DropForeignKey
ALTER TABLE "FeedbackRequest" DROP CONSTRAINT "FeedbackRequest_templateId_fkey";

-- DropForeignKey
ALTER TABLE "FeedbackRequest" DROP CONSTRAINT "FeedbackRequest_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "FeedbackRequest" DROP CONSTRAINT "FeedbackRequest_feedbackId_fkey";

-- DropForeignKey
ALTER TABLE "Uri" DROP CONSTRAINT "Uri_integrationId_fkey";

-- DropForeignKey
ALTER TABLE "Uri" DROP CONSTRAINT "Uri_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "Uri" DROP CONSTRAINT "Uri_userId_fkey";

-- DropForeignKey
ALTER TABLE "UriClaim" DROP CONSTRAINT "UriClaim_userId_fkey";

-- DropForeignKey
ALTER TABLE "UriClaim" DROP CONSTRAINT "UriClaim_uriId_fkey";

-- DropForeignKey
ALTER TABLE "Integration" DROP CONSTRAINT "Integration_slugId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_userId_fkey";

-- DropTable
DROP TABLE "FeedbackRequest";

-- DropTable
DROP TABLE "Uri";

-- DropTable
DROP TABLE "UriClaim";

-- DropTable
DROP TABLE "Integration";

-- DropTable
DROP TABLE "Payment";

-- DropEnum
DROP TYPE "PayableResource";

-- DropEnum
DROP TYPE "FeedbackRequestStatus";
