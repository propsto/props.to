-- DropIndex
DROP INDEX "TemplateCategory_name_key";

-- CreateTable
CREATE TABLE "OrgMemberNotificationPrefs" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "feedbackAlerts" BOOLEAN NOT NULL DEFAULT true,
    "weeklyDigest" BOOLEAN NOT NULL DEFAULT false,
    "mentionNotifications" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrgMemberNotificationPrefs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrgMemberNotificationPrefs_memberId_key" ON "OrgMemberNotificationPrefs"("memberId");

-- AddForeignKey
ALTER TABLE "OrgMemberNotificationPrefs" ADD CONSTRAINT "OrgMemberNotificationPrefs_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "OrganizationMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;
