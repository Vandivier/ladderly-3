/*
  Warnings:

  - A unique constraint covering the columns `[type,name]` on the table `Votable` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "VotableType" ADD VALUE 'CERTIFICATION';
ALTER TYPE "VotableType" ADD VALUE 'FOOD';
ALTER TYPE "VotableType" ADD VALUE 'JOB_TITLE';
ALTER TYPE "VotableType" ADD VALUE 'TECH_INFLUENCER';

-- CreateIndex
CREATE UNIQUE INDEX "Votable_type_name_key" ON "Votable"("type", "name");
