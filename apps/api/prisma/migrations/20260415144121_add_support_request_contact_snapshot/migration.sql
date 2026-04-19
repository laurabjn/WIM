/*
  Warnings:

  - Added the required column `user_email` to the `support_requests` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "support_requests" ADD COLUMN     "user_email" TEXT NOT NULL,
ADD COLUMN     "user_full_name" TEXT;
