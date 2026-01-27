/*
  Warnings:

  - Made the column `userId` on table `Feedback` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Feedback" DROP CONSTRAINT "Feedback_userId_fkey";

-- AlterTable
ALTER TABLE "Feedback" ADD COLUMN     "groupNameSnapshot" TEXT,
ADD COLUMN     "organizationNameSnapshot" TEXT,
ADD COLUMN     "userOrgRoleSnapshot" TEXT,
ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Slug" ADD COLUMN     "orgSlugOwnerId" TEXT;

-- AddForeignKey
ALTER TABLE "Slug" ADD CONSTRAINT "Slug_orgSlugOwnerId_fkey" FOREIGN KEY ("orgSlugOwnerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
