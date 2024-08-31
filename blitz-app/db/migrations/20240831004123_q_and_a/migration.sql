/*
  Warnings:

  - The values [SCHOOL] on the enum `VotableType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `votableAId` on the `Vote` table. All the data in the column will be lost.
  - You are about to drop the column `votableBId` on the `Vote` table. All the data in the column will be lost.
  - You are about to drop the column `winnerId` on the `Vote` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[voterId,votableId]` on the table `Vote` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `votableId` to the `Vote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `voteType` to the `Vote` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "VoteType" AS ENUM ('UPVOTE', 'DOWNVOTE');

-- AlterEnum
BEGIN;
CREATE TYPE "VotableType_new" AS ENUM ('ANSWER', 'CERTIFICATION', 'COMPANY', 'CONTENT', 'EDUCATOR', 'FOOD', 'JOB_TITLE', 'QUESTION', 'SKILL', 'TECH_INFLUENCER');
ALTER TABLE "Votable" ALTER COLUMN "type" TYPE "VotableType_new" USING ("type"::text::"VotableType_new");
ALTER TYPE "VotableType" RENAME TO "VotableType_old";
ALTER TYPE "VotableType_new" RENAME TO "VotableType";
DROP TYPE "VotableType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_votableAId_fkey";

-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_votableBId_fkey";

-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_winnerId_fkey";

-- AlterTable
ALTER TABLE "Votable" ADD COLUMN     "authorId" INTEGER,
ADD COLUMN     "body" TEXT,
ADD COLUMN     "isAccepted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "parentVotableId" INTEGER;

-- AlterTable
ALTER TABLE "Vote" DROP COLUMN "votableAId",
DROP COLUMN "votableBId",
DROP COLUMN "winnerId",
ADD COLUMN     "votableId" INTEGER NOT NULL,
ADD COLUMN     "voteType" "VoteType" NOT NULL;

-- CreateTable
CREATE TABLE "Comment" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "body" TEXT NOT NULL,
    "authorId" INTEGER NOT NULL,
    "votableId" INTEGER NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Vote_voterId_votableId_key" ON "Vote"("voterId", "votableId");

-- AddForeignKey
ALTER TABLE "Votable" ADD CONSTRAINT "Votable_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Votable" ADD CONSTRAINT "Votable_parentVotableId_fkey" FOREIGN KEY ("parentVotableId") REFERENCES "Votable"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_votableId_fkey" FOREIGN KEY ("votableId") REFERENCES "Votable"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_votableId_fkey" FOREIGN KEY ("votableId") REFERENCES "Votable"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
