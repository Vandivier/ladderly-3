/*
  Warnings:

  - You are about to drop the column `checklistItemId` on the `Checklist` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `ChecklistItem` table. All the data in the column will be lost.
  - Added the required column `checklistId` to the `ChecklistItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Checklist" DROP CONSTRAINT "Checklist_checklistItemId_fkey";

-- DropForeignKey
ALTER TABLE "ChecklistItem" DROP CONSTRAINT "ChecklistItem_userId_fkey";

-- AlterTable
ALTER TABLE "Checklist" DROP COLUMN "checklistItemId";

-- AlterTable
ALTER TABLE "ChecklistItem" DROP COLUMN "userId",
ADD COLUMN     "checklistId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "ChecklistItem" ADD CONSTRAINT "ChecklistItem_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES "Checklist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
