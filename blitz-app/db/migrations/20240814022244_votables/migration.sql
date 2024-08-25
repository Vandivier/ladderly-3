-- CreateEnum
CREATE TYPE "VotableType" AS ENUM ('COMPANY', 'SCHOOL', 'SKILL');

-- CreateTable
CREATE TABLE "Votable" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "type" "VotableType" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tags" TEXT[],
    "prestigeScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "voteCount" INTEGER NOT NULL DEFAULT 0,
    "registeredUserVotes" INTEGER NOT NULL DEFAULT 0,
    "guestVotes" INTEGER NOT NULL DEFAULT 0,
    "website" TEXT,
    "miscInfo" JSONB NOT NULL,

    CONSTRAINT "Votable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VotableSnapshot" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "votableId" INTEGER NOT NULL,
    "prestigeScore" DOUBLE PRECISION NOT NULL,
    "voteCount" INTEGER NOT NULL,

    CONSTRAINT "VotableSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vote" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "voterId" INTEGER NOT NULL,
    "votableAId" INTEGER NOT NULL,
    "votableBId" INTEGER NOT NULL,
    "winnerId" INTEGER NOT NULL,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "VotableSnapshot" ADD CONSTRAINT "VotableSnapshot_votableId_fkey" FOREIGN KEY ("votableId") REFERENCES "Votable"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_voterId_fkey" FOREIGN KEY ("voterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_votableAId_fkey" FOREIGN KEY ("votableAId") REFERENCES "Votable"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_votableBId_fkey" FOREIGN KEY ("votableBId") REFERENCES "Votable"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "Votable"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
