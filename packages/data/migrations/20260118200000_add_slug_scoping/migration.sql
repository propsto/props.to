-- CreateEnum
CREATE TYPE "SlugScope" AS ENUM ('GLOBAL', 'ORGANIZATION');

-- AlterTable
ALTER TABLE "Slug" ADD COLUMN "scope" "SlugScope" NOT NULL DEFAULT 'GLOBAL';
ALTER TABLE "Slug" ADD COLUMN "scopedToOrgId" TEXT;

-- AddForeignKey
ALTER TABLE "Slug" ADD CONSTRAINT "Slug_scopedToOrgId_fkey" FOREIGN KEY ("scopedToOrgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex (slug uniqueness is scoped by scope and organization)
CREATE UNIQUE INDEX "Slug_slug_scope_scopedToOrgId_key" ON "Slug"("slug", "scope", "scopedToOrgId");
