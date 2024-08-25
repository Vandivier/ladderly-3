-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_voterId_fkey";

-- AlterTable
ALTER TABLE "Vote" ALTER COLUMN "voterId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_voterId_fkey" FOREIGN KEY ("voterId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
