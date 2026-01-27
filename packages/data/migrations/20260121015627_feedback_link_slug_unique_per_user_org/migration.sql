-- DropIndex
DROP INDEX "FeedbackLink_slug_key";

-- CreateIndex
CREATE UNIQUE INDEX "FeedbackLink_userId_organizationId_slug_key" ON "FeedbackLink"("userId", "organizationId", "slug");
