-- AlterTable
ALTER TABLE "User" ADD COLUMN     "hasInPersonEventInterest" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasOnlineEventInterest" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "residenceCountry" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "residenceUSState" TEXT NOT NULL DEFAULT '';
