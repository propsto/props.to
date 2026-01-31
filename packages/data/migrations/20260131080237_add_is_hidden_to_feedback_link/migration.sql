-- DropIndex
DROP INDEX "TemplateCategory_name_key";

-- AlterTable
ALTER TABLE "FeedbackLink" ADD COLUMN     "isHidden" BOOLEAN NOT NULL DEFAULT false;
