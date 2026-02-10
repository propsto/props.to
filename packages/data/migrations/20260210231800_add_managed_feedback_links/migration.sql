-- Add managed link support to FeedbackLink
-- Managed links are created by org admins as templates for employees to adopt

-- isManaged: true if this is a managed link template (created by admin)
ALTER TABLE "FeedbackLink" ADD COLUMN "isManaged" BOOLEAN NOT NULL DEFAULT false;

-- managedByUserId: the admin who created this managed link (null for personal links)
ALTER TABLE "FeedbackLink" ADD COLUMN "managedByUserId" TEXT;

-- sourceManaged: reference to the managed link this was adopted from (null for originals)
ALTER TABLE "FeedbackLink" ADD COLUMN "sourceManagedId" TEXT;

-- Add foreign key constraints
ALTER TABLE "FeedbackLink" ADD CONSTRAINT "FeedbackLink_managedByUserId_fkey" FOREIGN KEY ("managedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "FeedbackLink" ADD CONSTRAINT "FeedbackLink_sourceManagedId_fkey" FOREIGN KEY ("sourceManagedId") REFERENCES "FeedbackLink"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Index for finding managed links in an org
CREATE INDEX "FeedbackLink_organizationId_isManaged_idx" ON "FeedbackLink"("organizationId", "isManaged") WHERE "isManaged" = true;

-- Index for finding links adopted from a managed source
CREATE INDEX "FeedbackLink_sourceManagedId_idx" ON "FeedbackLink"("sourceManagedId") WHERE "sourceManagedId" IS NOT NULL;
