-- Archiving takes an org value or level out of pickers and selects without
-- deleting it, so feedback, conversations and members that reference it keep
-- showing its name. Null means active.

-- AlterTable
ALTER TABLE "OrgValue" ADD COLUMN "archivedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "OrgLevel" ADD COLUMN "archivedAt" TIMESTAMP(3);
