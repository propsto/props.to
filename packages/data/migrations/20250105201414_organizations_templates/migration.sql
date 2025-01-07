/*
  Warnings:

  - You are about to drop the column `feedbackText` on the `Feedback` table. All the data in the column will be lost.
  - You are about to drop the column `uri` on the `Feedback` table. All the data in the column will be lost.
  - You are about to drop the column `domain` on the `Integration` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `UriSupport` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[slugId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,slugId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `templateId` to the `Feedback` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Feedback` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hostname` to the `Integration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slugId` to the `Integration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slugId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "PayableResource" ADD VALUE 'FEEDBACK_TEMPLATE';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Role" ADD VALUE 'ORGANIZATION_ADMIN';
ALTER TYPE "Role" ADD VALUE 'GROUP_ADMIN';

-- DropForeignKey
ALTER TABLE "Feedback" DROP CONSTRAINT "Feedback_userId_fkey";

-- DropForeignKey
ALTER TABLE "UriClaim" DROP CONSTRAINT "UriClaim_uriId_fkey";

-- DropForeignKey
ALTER TABLE "UriSupport" DROP CONSTRAINT "UriSupport_integrationId_fkey";

-- DropIndex
DROP INDEX "User_username_key";

-- AlterTable
ALTER TABLE "Feedback" DROP COLUMN "feedbackText",
DROP COLUMN "uri",
ADD COLUMN     "fieldsData" JSONB,
ADD COLUMN     "groupId" TEXT,
ADD COLUMN     "organizationId" TEXT,
ADD COLUMN     "templateId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Integration" DROP COLUMN "domain",
ADD COLUMN     "hostname" TEXT NOT NULL,
ADD COLUMN     "slugId" TEXT NOT NULL,
ALTER COLUMN "subpath" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "username",
ADD COLUMN     "organizationId" TEXT,
ADD COLUMN     "slugId" TEXT NOT NULL;

-- DropTable
DROP TABLE "UriSupport";

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slugId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Group" (
    "id" TEXT NOT NULL,
    "slugId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Slug" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Slug_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupAdmin" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GroupAdmin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeedbackTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION,
    "deletedAt" TIMESTAMP(3),
    "filePath" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeedbackTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Uri" (
    "id" BIGSERIAL NOT NULL,
    "uri" TEXT NOT NULL,
    "integrationId" BIGINT,
    "organizationId" TEXT,
    "userId" TEXT,

    CONSTRAINT "Uri_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_GroupToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_GroupToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_OrganizationTemplates" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_OrganizationTemplates_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_GroupTemplates" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_GroupTemplates_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_UserTemplates" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_UserTemplates_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_name_key" ON "Organization"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slugId_key" ON "Organization"("slugId");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_id_slugId_key" ON "Organization"("id", "slugId");

-- CreateIndex
CREATE UNIQUE INDEX "Group_slugId_organizationId_key" ON "Group"("slugId", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Uri_uri_key" ON "Uri"("uri");

-- CreateIndex
CREATE UNIQUE INDEX "Uri_uri_organizationId_key" ON "Uri"("uri", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Uri_uri_userId_key" ON "Uri"("uri", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Uri_uri_integrationId_key" ON "Uri"("uri", "integrationId");

-- CreateIndex
CREATE INDEX "_GroupToUser_B_index" ON "_GroupToUser"("B");

-- CreateIndex
CREATE INDEX "_OrganizationTemplates_B_index" ON "_OrganizationTemplates"("B");

-- CreateIndex
CREATE INDEX "_GroupTemplates_B_index" ON "_GroupTemplates"("B");

-- CreateIndex
CREATE INDEX "_UserTemplates_B_index" ON "_UserTemplates"("B");

-- CreateIndex
CREATE UNIQUE INDEX "User_slugId_key" ON "User"("slugId");

-- CreateIndex
CREATE UNIQUE INDEX "User_id_slugId_key" ON "User"("id", "slugId");

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_slugId_fkey" FOREIGN KEY ("slugId") REFERENCES "Slug"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_slugId_fkey" FOREIGN KEY ("slugId") REFERENCES "Slug"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_slugId_fkey" FOREIGN KEY ("slugId") REFERENCES "Slug"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupAdmin" ADD CONSTRAINT "GroupAdmin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupAdmin" ADD CONSTRAINT "GroupAdmin_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "FeedbackTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Uri" ADD CONSTRAINT "Uri_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "Integration"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Uri" ADD CONSTRAINT "Uri_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Uri" ADD CONSTRAINT "Uri_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UriClaim" ADD CONSTRAINT "UriClaim_uriId_fkey" FOREIGN KEY ("uriId") REFERENCES "Uri"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Integration" ADD CONSTRAINT "Integration_slugId_fkey" FOREIGN KEY ("slugId") REFERENCES "Slug"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GroupToUser" ADD CONSTRAINT "_GroupToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GroupToUser" ADD CONSTRAINT "_GroupToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrganizationTemplates" ADD CONSTRAINT "_OrganizationTemplates_A_fkey" FOREIGN KEY ("A") REFERENCES "FeedbackTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrganizationTemplates" ADD CONSTRAINT "_OrganizationTemplates_B_fkey" FOREIGN KEY ("B") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GroupTemplates" ADD CONSTRAINT "_GroupTemplates_A_fkey" FOREIGN KEY ("A") REFERENCES "FeedbackTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GroupTemplates" ADD CONSTRAINT "_GroupTemplates_B_fkey" FOREIGN KEY ("B") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserTemplates" ADD CONSTRAINT "_UserTemplates_A_fkey" FOREIGN KEY ("A") REFERENCES "FeedbackTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserTemplates" ADD CONSTRAINT "_UserTemplates_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
