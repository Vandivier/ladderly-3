/*
  Warnings:

  - Made the column `version` on table `Checklist` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Checklist" ALTER COLUMN "version" SET NOT NULL;
