/*
  Warnings:

  - A unique constraint covering the columns `[userId,type]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_type_key" ON "Subscription"("userId", "type");
