ALTER TABLE "reviews" ADD COLUMN "reply" TEXT;
ALTER TABLE "reviews" ADD COLUMN "reply_at" TIMESTAMP(3);

ALTER TABLE "user_reports" ADD COLUMN "review_id" TEXT;

CREATE INDEX "user_reports_review_id_idx" ON "user_reports"("review_id");

ALTER TABLE "user_reports" ADD CONSTRAINT "user_reports_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE SET NULL ON UPDATE CASCADE;
