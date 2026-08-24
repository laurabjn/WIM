ALTER TABLE "exchanges" ADD COLUMN "start_reminder_at" TIMESTAMP(3);
ALTER TABLE "exchanges" ADD COLUMN "end_reminder_at" TIMESTAMP(3);

CREATE INDEX "exchanges_status_start_date_idx" ON "exchanges"("status", "start_date");
