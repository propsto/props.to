-- CreateTable
CREATE TABLE "PendingAccountLink" (
    "token" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PendingAccountLink_pkey" PRIMARY KEY ("token")
);

-- CreateIndex
CREATE UNIQUE INDEX "PendingAccountLink_email_key" ON "PendingAccountLink"("email");

-- Old links carried the OAuth tokens inside the token string itself.
DELETE FROM "VerificationToken" WHERE "identifier" LIKE 'account-link:%';
