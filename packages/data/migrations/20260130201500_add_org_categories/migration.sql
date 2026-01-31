-- AlterTable: Add organization-specific categories support
-- Categories can now be global (organizationId = null) or organization-specific

-- Remove the global unique constraint on name
ALTER TABLE "TemplateCategory" DROP CONSTRAINT IF EXISTS "TemplateCategory_name_key";

-- Add organizationId column (nullable for global categories)
ALTER TABLE "TemplateCategory" ADD COLUMN "organizationId" TEXT;

-- Add color column for UI customization
ALTER TABLE "TemplateCategory" ADD COLUMN "color" TEXT;

-- Add foreign key constraint
ALTER TABLE "TemplateCategory" ADD CONSTRAINT "TemplateCategory_organizationId_fkey" 
    FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") 
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Add unique constraint: name must be unique within scope (global or per-org)
ALTER TABLE "TemplateCategory" ADD CONSTRAINT "TemplateCategory_organizationId_name_key" 
    UNIQUE ("organizationId", "name");
