-- AlterTable
ALTER TABLE "reviews" ADD COLUMN "exchange_id" TEXT;

-- AlterTable
ALTER TABLE "exchanges" ADD COLUMN "review_reminder_at" TIMESTAMP(3);

-- DropIndex
-- Un avis par logement et par personne interdisait de noter un second sejour
-- dans le meme logement.
DROP INDEX IF EXISTS "reviews_home_id_author_id_key";

-- CreateIndex
CREATE UNIQUE INDEX "reviews_exchange_id_author_id_key" ON "reviews"("exchange_id", "author_id");

-- CreateIndex
CREATE INDEX "exchanges_status_end_date_idx" ON "exchanges"("status", "end_date");

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_exchange_id_fkey" FOREIGN KEY ("exchange_id") REFERENCES "exchanges"("id") ON DELETE SET NULL ON UPDATE CASCADE;
