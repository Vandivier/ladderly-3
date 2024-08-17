/*
  Warnings:

  - You are about to drop the `SubscriptionChange` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ContributionTypeEnum" AS ENUM ('ONE_TIME', 'RECURRING');

-- DropForeignKey
ALTER TABLE "SubscriptionChange" DROP CONSTRAINT "SubscriptionChange_subscriptionId_fkey";

-- DropForeignKey
ALTER TABLE "SubscriptionChange" DROP CONSTRAINT "SubscriptionChange_userId_fkey";

-- DropTable
DROP TABLE "SubscriptionChange";

-- CreateTable
CREATE TABLE "Contribution" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id" SERIAL NOT NULL,
    "amount" INTEGER NOT NULL,
    "newTier" "PaymentTierEnum" NOT NULL,
    "previousTier" "PaymentTierEnum" NOT NULL,
    "stripeTransactionId" TEXT,
    "type" "ContributionTypeEnum" NOT NULL DEFAULT 'ONE_TIME',
    "subscriptionId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Contribution_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
