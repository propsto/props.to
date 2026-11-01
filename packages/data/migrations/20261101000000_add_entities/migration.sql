-- AlterEnum
ALTER TYPE "AuditAction" ADD VALUE 'ENTITY_CREATED';
ALTER TYPE "AuditAction" ADD VALUE 'ENTITY_UPDATED';
ALTER TYPE "AuditAction" ADD VALUE 'ENTITY_DELETED';
ALTER TYPE "AuditAction" ADD VALUE 'ENTITY_LINK_CREATED';

-- AlterTable
ALTER TABLE "Feedback" ADD COLUMN     "context" VARCHAR(300),
ADD COLUMN     "entityId" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "FeedbackLink" ADD COLUMN     "entityId" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- Exactly one owner: a person (userId) or an entity (entityId), never both or neither.
-- Entity feedback can never carry a recipient, so no person-scoped query can return it.
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_person_xor_entity" CHECK (("userId" IS NULL) <> ("entityId" IS NULL));
ALTER TABLE "FeedbackLink" ADD CONSTRAINT "FeedbackLink_person_xor_entity" CHECK (("userId" IS NULL) <> ("entityId" IS NULL));

-- CreateTable
CREATE TABLE "Entity" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "slugId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Entity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Entity_slugId_key" ON "Entity"("slugId");

-- CreateIndex
CREATE INDEX "Entity_organizationId_idx" ON "Entity"("organizationId");

-- CreateIndex
CREATE INDEX "Feedback_entityId_idx" ON "Feedback"("entityId");

-- CreateIndex
CREATE UNIQUE INDEX "FeedbackLink_entityId_slug_key" ON "FeedbackLink"("entityId", "slug");

-- AddForeignKey
ALTER TABLE "Entity" ADD CONSTRAINT "Entity_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entity" ADD CONSTRAINT "Entity_slugId_fkey" FOREIGN KEY ("slugId") REFERENCES "Slug"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackLink" ADD CONSTRAINT "FeedbackLink_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
