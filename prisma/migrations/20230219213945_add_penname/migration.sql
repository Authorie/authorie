/*
  Warnings:

  - A unique constraint covering the columns `[penname]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "penname" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_penname_key" ON "users"("penname");
