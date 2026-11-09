-- Per-org switch for the conversations layer. Defaults to on so existing
-- organizations keep their conversations; an org without that process turns
-- it off in admin settings.

-- AlterTable
ALTER TABLE "OrganizationSettings" ADD COLUMN "enableConversations" BOOLEAN NOT NULL DEFAULT true;
