/*
  Warnings:

  - You are about to drop the column `isComplete` on the `Checklist` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Checklist` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[displayText,checklistId]` on the table `ChecklistItem` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Checklist" DROP CONSTRAINT "Checklist_userId_fkey";

-- AlterTable
ALTER TABLE "Checklist" DROP COLUMN "isComplete",
DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "ChecklistItem" ALTER COLUMN "isComplete" SET DEFAULT false;

-- CreateTable
CREATE TABLE "UserChecklist" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "checklistId" INTEGER NOT NULL,
    "isComplete" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UserChecklist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserChecklist_userId_checklistId_key" ON "UserChecklist"("userId", "checklistId");

-- CreateIndex
CREATE UNIQUE INDEX "ChecklistItem_displayText_checklistId_key" ON "ChecklistItem"("displayText", "checklistId");

-- AddForeignKey
ALTER TABLE "UserChecklist" ADD CONSTRAINT "UserChecklist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserChecklist" ADD CONSTRAINT "UserChecklist_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES "Checklist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
