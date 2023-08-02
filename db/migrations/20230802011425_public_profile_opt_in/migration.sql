-- AlterTable
ALTER TABLE "User" ADD COLUMN     "hasPublicProfileEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasShoutOutsEnabled" BOOLEAN NOT NULL DEFAULT false;
