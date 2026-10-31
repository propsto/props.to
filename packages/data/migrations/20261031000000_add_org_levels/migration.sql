-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditAction" ADD VALUE 'LEVEL_CREATED';
ALTER TYPE "AuditAction" ADD VALUE 'LEVEL_UPDATED';
ALTER TYPE "AuditAction" ADD VALUE 'MEMBER_LEVEL_CHANGED';

-- AlterTable
ALTER TABLE "OrganizationMember" ADD COLUMN     "levelId" TEXT;

-- AlterTable
ALTER TABLE "Feedback" ADD COLUMN     "recipientLevelName" TEXT;

-- CreateTable
CREATE TABLE "OrgLevel" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "summary" TEXT,
    "rubric" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrgLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrgLevelValueExpectation" (
    "levelId" TEXT NOT NULL,
    "valueId" TEXT NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "OrgLevelValueExpectation_pkey" PRIMARY KEY ("levelId","valueId")
);

-- CreateIndex
CREATE INDEX "OrgLevel_organizationId_order_idx" ON "OrgLevel"("organizationId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "OrgLevel_organizationId_name_key" ON "OrgLevel"("organizationId", "name");

-- CreateIndex
CREATE INDEX "OrgLevelValueExpectation_valueId_idx" ON "OrgLevelValueExpectation"("valueId");

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "OrgLevel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgLevel" ADD CONSTRAINT "OrgLevel_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgLevelValueExpectation" ADD CONSTRAINT "OrgLevelValueExpectation_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "OrgLevel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgLevelValueExpectation" ADD CONSTRAINT "OrgLevelValueExpectation_valueId_fkey" FOREIGN KEY ("valueId") REFERENCES "OrgValue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

