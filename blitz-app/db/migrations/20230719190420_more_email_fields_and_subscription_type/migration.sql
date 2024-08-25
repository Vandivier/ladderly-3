/*
  Warnings:

  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `stripeCustomerId` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'ACCOUNT_PLAN';

-- AlterTable
ALTER TABLE "SubscriptionChange" ADD COLUMN     "stripeTransactionId" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "name",
DROP COLUMN "stripeCustomerId",
ADD COLUMN     "adminNotes" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "emailBackup" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "emailStripe" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "nameFirst" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "nameLast" TEXT NOT NULL DEFAULT '';
