-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditAction" ADD VALUE 'VALUE_CREATED';
ALTER TYPE "AuditAction" ADD VALUE 'VALUE_UPDATED';
ALTER TYPE "AuditAction" ADD VALUE 'VALUE_DELETED';

-- CreateTable
CREATE TABLE "OrgValue" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrgValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeedbackValue" (
    "feedbackId" BIGINT NOT NULL,
    "valueId" TEXT NOT NULL,

    CONSTRAINT "FeedbackValue_pkey" PRIMARY KEY ("feedbackId","valueId")
);

-- CreateIndex
CREATE INDEX "OrgValue_organizationId_order_idx" ON "OrgValue"("organizationId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "OrgValue_organizationId_name_key" ON "OrgValue"("organizationId", "name");

-- CreateIndex
CREATE INDEX "FeedbackValue_valueId_idx" ON "FeedbackValue"("valueId");

-- AddForeignKey
ALTER TABLE "OrgValue" ADD CONSTRAINT "OrgValue_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackValue" ADD CONSTRAINT "FeedbackValue_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES "Feedback"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackValue" ADD CONSTRAINT "FeedbackValue_valueId_fkey" FOREIGN KEY ("valueId") REFERENCES "OrgValue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

