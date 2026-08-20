-- AlterEnum
ALTER TYPE "MessageType" ADD VALUE 'AUDIO';

-- AlterTable
ALTER TABLE "Message" ADD COLUMN "attachment_duration_ms" INTEGER;
