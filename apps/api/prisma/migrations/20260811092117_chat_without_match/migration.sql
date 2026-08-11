-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_matchId_fkey";

-- AlterTable
ALTER TABLE "Chat" ALTER COLUMN "matchId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE SET NULL ON UPDATE CASCADE;
