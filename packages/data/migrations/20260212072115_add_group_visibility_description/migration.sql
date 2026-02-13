-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "description" TEXT,
ADD COLUMN     "visibility" "ProfileVisibility" NOT NULL DEFAULT 'ORGANIZATION';
