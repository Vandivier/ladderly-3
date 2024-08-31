/*
  Warnings:

  - You are about to drop the column `description` on the `Votable` table. All the data in the column will be lost.
  - You are about to drop the `Comment` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `voterId` on table `Vote` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
ALTER TYPE "VotableType" ADD VALUE 'COMMENT';

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_authorId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_votableId_fkey";

-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_voterId_fkey";

-- AlterTable
ALTER TABLE "Votable" DROP COLUMN "description";

-- AlterTable
ALTER TABLE "Vote" ALTER COLUMN "voterId" SET NOT NULL;

-- DropTable
DROP TABLE "Comment";

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_voterId_fkey" FOREIGN KEY ("voterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
