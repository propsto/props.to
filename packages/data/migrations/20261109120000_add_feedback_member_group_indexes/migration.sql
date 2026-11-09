-- Prisma on PostgreSQL does not index foreign keys. The received and sent
-- lists, the org feed, the moderation queue and the stats filter Feedback on
-- these columns; member and group lists filter by organizationId.

-- CreateIndex
CREATE INDEX "Feedback_userId_status_createdAt_idx" ON "Feedback"("userId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "Feedback_organizationId_status_createdAt_idx" ON "Feedback"("organizationId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "Feedback_submitterId_idx" ON "Feedback"("submitterId");

-- CreateIndex
CREATE INDEX "Feedback_linkId_idx" ON "Feedback"("linkId");

-- CreateIndex
CREATE INDEX "OrganizationMember_organizationId_idx" ON "OrganizationMember"("organizationId");

-- CreateIndex
CREATE INDEX "Group_organizationId_idx" ON "Group"("organizationId");
