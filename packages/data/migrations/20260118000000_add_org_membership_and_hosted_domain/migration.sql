-- CreateEnum: OrganizationRole for org-specific roles
CREATE TYPE "OrganizationRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- Add hostedDomain columns (before any other changes)
ALTER TABLE "Organization" ADD COLUMN "hostedDomain" TEXT;
ALTER TABLE "User" ADD COLUMN "hostedDomain" TEXT;

-- CreateTable: OrganizationMember junction table for multi-org support
CREATE TABLE "OrganizationMember" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "role" "OrganizationRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrganizationMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: Unique constraint for user-org pairs
CREATE UNIQUE INDEX "OrganizationMember_userId_organizationId_key" ON "OrganizationMember"("userId", "organizationId");

-- CreateIndex: Unique constraint for hostedDomain on Organization
CREATE UNIQUE INDEX "Organization_hostedDomain_key" ON "Organization"("hostedDomain");

-- AddForeignKey: Link OrganizationMember to User
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: Link OrganizationMember to Organization
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DataMigration: Migrate existing users with organizationId to OrganizationMember
-- Users with ORGANIZATION_ADMIN role become OWNER, others become MEMBER
INSERT INTO "OrganizationMember" ("id", "userId", "organizationId", "role", "joinedAt")
SELECT
    gen_random_uuid()::text,
    u."id",
    u."organizationId",
    CASE WHEN u."role" = 'ORGANIZATION_ADMIN' THEN 'OWNER'::"OrganizationRole" ELSE 'MEMBER'::"OrganizationRole" END,
    CURRENT_TIMESTAMP
FROM "User" u
WHERE u."organizationId" IS NOT NULL;

-- DataMigration: Update ORGANIZATION_ADMIN and GROUP_ADMIN users to USER role
UPDATE "User" SET "role" = 'USER' WHERE "role" IN ('ORGANIZATION_ADMIN', 'GROUP_ADMIN');

-- DropForeignKey: Remove old User -> Organization direct relation
ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_organizationId_fkey";

-- AlterTable: Drop the old organizationId column
ALTER TABLE "User" DROP COLUMN IF EXISTS "organizationId";

-- AlterEnum: Remove ORGANIZATION_ADMIN and GROUP_ADMIN from Role enum
-- Note: This must be done after data migration to avoid constraint violations
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('USER', 'PROPSTO_ADMIN');
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'USER';
COMMIT;
