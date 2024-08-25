-- AlterTable
ALTER TABLE "User" ADD COLUMN     "hasLiveStreamInterest" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasSmallGroupInterest" BOOLEAN NOT NULL DEFAULT false;
