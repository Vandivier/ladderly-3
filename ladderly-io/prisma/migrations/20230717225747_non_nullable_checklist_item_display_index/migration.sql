/*
  Warnings:

  - Made the column `displayIndex` on table `ChecklistItem` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ChecklistItem" ALTER COLUMN "displayIndex" SET NOT NULL;
