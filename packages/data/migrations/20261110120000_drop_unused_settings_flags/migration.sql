-- Five settings flags nothing reads (#185). Rows stay; only the columns go.
ALTER TABLE "OrganizationSettings"
  DROP COLUMN "enableGroupManagement",
  DROP COLUMN "requireEmailVerification",
  DROP COLUMN "enableSSOIntegration";

ALTER TABLE "OrganizationDefaultUserSettings"
  DROP COLUMN "defaultProfileVisibility",
  DROP COLUMN "requireApprovalForPublicProfiles";
