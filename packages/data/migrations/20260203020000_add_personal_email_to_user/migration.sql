-- AlterTable
ALTER TABLE "User" ADD COLUMN "personalEmail" TEXT;
ALTER TABLE "User" ADD COLUMN "personalEmailVerified" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "User_personalEmail_key" ON "User"("personalEmail");
