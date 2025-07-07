-- CreateTable
CREATE TABLE "OrganizationDefaultUserSettings" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "defaultProfileVisibility" "ProfileVisibility" NOT NULL DEFAULT 'ORGANIZATION',
    "allowExternalFeedback" BOOLEAN NOT NULL DEFAULT false,
    "requireApprovalForPublicProfiles" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationDefaultUserSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationSettings" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "allowUserInvites" BOOLEAN NOT NULL DEFAULT true,
    "enableGroupManagement" BOOLEAN NOT NULL DEFAULT true,
    "requireEmailVerification" BOOLEAN NOT NULL DEFAULT true,
    "enableSSOIntegration" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationFeedbackSettings" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "enableOrganizationFeedback" BOOLEAN NOT NULL DEFAULT true,
    "allowAnonymousFeedback" BOOLEAN NOT NULL DEFAULT false,
    "enableFeedbackModeration" BOOLEAN NOT NULL DEFAULT true,
    "autoApproveInternalFeedback" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationFeedbackSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationDefaultUserSettings_organizationId_key" ON "OrganizationDefaultUserSettings"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationSettings_organizationId_key" ON "OrganizationSettings"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationFeedbackSettings_organizationId_key" ON "OrganizationFeedbackSettings"("organizationId");

-- AddForeignKey
ALTER TABLE "OrganizationDefaultUserSettings" ADD CONSTRAINT "OrganizationDefaultUserSettings_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationSettings" ADD CONSTRAINT "OrganizationSettings_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationFeedbackSettings" ADD CONSTRAINT "OrganizationFeedbackSettings_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
