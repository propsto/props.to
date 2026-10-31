-- CreateEnum
CREATE TYPE "ConversationStatus" AS ENUM ('OPEN', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "ConversationStage" AS ENUM ('DIRECT', 'REPEATED', 'FINAL');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditAction" ADD VALUE 'CONVERSATION_OPENED';
ALTER TYPE "AuditAction" ADD VALUE 'CONVERSATION_STEP_ADDED';
ALTER TYPE "AuditAction" ADD VALUE 'CONVERSATION_RESOLVED';

-- AlterTable
ALTER TABLE "Feedback" ADD COLUMN     "conversationId" TEXT;

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "subjectUserId" TEXT NOT NULL,
    "openedById" TEXT,
    "status" "ConversationStatus" NOT NULL DEFAULT 'OPEN',
    "valueId" TEXT,
    "levelNameSnapshot" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationStep" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "stage" "ConversationStage" NOT NULL,
    "ownerId" TEXT,
    "sharedNote" TEXT NOT NULL,
    "internalNote" TEXT,
    "reviewAt" TIMESTAMP(3),
    "consequence" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConversationStep_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Conversation_organizationId_subjectUserId_idx" ON "Conversation"("organizationId", "subjectUserId");

-- CreateIndex
CREATE INDEX "ConversationStep_conversationId_createdAt_idx" ON "ConversationStep"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "Feedback_conversationId_idx" ON "Feedback"("conversationId");

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_subjectUserId_fkey" FOREIGN KEY ("subjectUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_openedById_fkey" FOREIGN KEY ("openedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_valueId_fkey" FOREIGN KEY ("valueId") REFERENCES "OrgValue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationStep" ADD CONSTRAINT "ConversationStep_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationStep" ADD CONSTRAINT "ConversationStep_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

