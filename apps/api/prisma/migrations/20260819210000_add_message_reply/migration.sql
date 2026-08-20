-- AlterTable
ALTER TABLE "Message" ADD COLUMN "reply_to_id" TEXT;

-- CreateIndex
CREATE INDEX "Message_reply_to_id_idx" ON "Message"("reply_to_id");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_reply_to_id_fkey" FOREIGN KEY ("reply_to_id") REFERENCES "Message"("id") ON DELETE SET NULL ON UPDATE CASCADE;
