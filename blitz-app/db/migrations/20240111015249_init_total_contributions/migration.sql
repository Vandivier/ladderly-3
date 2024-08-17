/*
  Warnings:

  - You are about to drop the column `newTier` on the `Contribution` table. All the data in the column will be lost.
  - You are about to drop the column `previousTier` on the `Contribution` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[contributedAt,userId]` on the table `Contribution` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[subscriptionId,userId]` on the table `Contribution` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `contributedAt` to the `Contribution` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Contribution" DROP COLUMN "newTier",
DROP COLUMN "previousTier",
ADD COLUMN     "contributedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "amount" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "totalContributions" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "totalStoreSpend" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "Contribution_contributedAt_userId_key" ON "Contribution"("contributedAt", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Contribution_subscriptionId_userId_key" ON "Contribution"("subscriptionId", "userId");
