-- AlterTable
ALTER TABLE "OrganizationFeedbackSettings" ADD COLUMN "defaultTemplateId" TEXT;

-- AddForeignKey
ALTER TABLE "OrganizationFeedbackSettings" ADD CONSTRAINT "OrganizationFeedbackSettings_defaultTemplateId_fkey" FOREIGN KEY ("defaultTemplateId") REFERENCES "FeedbackTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
