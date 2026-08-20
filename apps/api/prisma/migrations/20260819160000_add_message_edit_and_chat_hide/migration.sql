-- AlterTable
ALTER TABLE "Message" ADD COLUMN "edited_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ChatParticipant" ADD COLUMN "hidden_at" TIMESTAMP(3);
