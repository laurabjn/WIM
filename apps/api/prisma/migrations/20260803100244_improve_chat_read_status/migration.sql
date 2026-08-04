-- AlterTable
ALTER TABLE "ChatParticipant" ADD COLUMN     "lastReadAt" TIMESTAMP(3),
ADD COLUMN     "lastReadMessageId" TEXT;

-- AddForeignKey
ALTER TABLE "ChatParticipant" ADD CONSTRAINT "ChatParticipant_lastReadMessageId_fkey" FOREIGN KEY ("lastReadMessageId") REFERENCES "Message"("id") ON DELETE SET NULL ON UPDATE CASCADE;
