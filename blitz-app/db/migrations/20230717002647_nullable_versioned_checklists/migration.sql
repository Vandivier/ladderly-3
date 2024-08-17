-- AlterTable
ALTER TABLE "Checklist" ADD COLUMN     "version" TEXT;

-- CreateTable
CREATE TABLE "FlashCard" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "frontText" TEXT NOT NULL,
    "backText" TEXT NOT NULL,
    "sourcePlatformId" TEXT NOT NULL,
    "sourcePlatformName" TEXT NOT NULL,
    "flashCardDeckId" INTEGER,

    CONSTRAINT "FlashCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PossibleAnswer" (
    "id" SERIAL NOT NULL,
    "inputId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "quizItemId" INTEGER NOT NULL,
    "correctAnswerForId" INTEGER,

    CONSTRAINT "PossibleAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizItem" (
    "id" SERIAL NOT NULL,
    "inputId" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "correctAnswerId" INTEGER,
    "quizId" INTEGER NOT NULL,

    CONSTRAINT "QuizItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quiz" (
    "id" SERIAL NOT NULL,
    "inputId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sourcePlatformId" TEXT NOT NULL,
    "sourcePlatformName" TEXT NOT NULL,

    CONSTRAINT "Quiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CurriculumUnit" (
    "id" SERIAL NOT NULL,
    "inputId" TEXT NOT NULL,
    "quizId" INTEGER NOT NULL,
    "flashCardDeckId" INTEGER NOT NULL,

    CONSTRAINT "CurriculumUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlashCardDeck" (
    "id" SERIAL NOT NULL,

    CONSTRAINT "FlashCardDeck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizResult" (
    "id" SERIAL NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "quizId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "QuizResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PossibleAnswer_inputId_key" ON "PossibleAnswer"("inputId");

-- CreateIndex
CREATE UNIQUE INDEX "QuizItem_inputId_key" ON "QuizItem"("inputId");

-- CreateIndex
CREATE UNIQUE INDEX "QuizItem_correctAnswerId_key" ON "QuizItem"("correctAnswerId");

-- CreateIndex
CREATE UNIQUE INDEX "Quiz_inputId_key" ON "Quiz"("inputId");

-- CreateIndex
CREATE UNIQUE INDEX "Quiz_name_key" ON "Quiz"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CurriculumUnit_inputId_key" ON "CurriculumUnit"("inputId");

-- AddForeignKey
ALTER TABLE "FlashCard" ADD CONSTRAINT "FlashCard_flashCardDeckId_fkey" FOREIGN KEY ("flashCardDeckId") REFERENCES "FlashCardDeck"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PossibleAnswer" ADD CONSTRAINT "PossibleAnswer_quizItemId_fkey" FOREIGN KEY ("quizItemId") REFERENCES "QuizItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizItem" ADD CONSTRAINT "QuizItem_correctAnswerId_fkey" FOREIGN KEY ("correctAnswerId") REFERENCES "PossibleAnswer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizItem" ADD CONSTRAINT "QuizItem_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurriculumUnit" ADD CONSTRAINT "CurriculumUnit_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurriculumUnit" ADD CONSTRAINT "CurriculumUnit_flashCardDeckId_fkey" FOREIGN KEY ("flashCardDeckId") REFERENCES "FlashCardDeck"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizResult" ADD CONSTRAINT "QuizResult_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizResult" ADD CONSTRAINT "QuizResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
