-- AlterTable
ALTER TABLE "ChecklistItem" ADD COLUMN     "isRequired" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "linkText" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "linkUri" TEXT NOT NULL DEFAULT '';
