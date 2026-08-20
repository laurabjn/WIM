-- AlterTable
ALTER TABLE "users" ADD COLUMN "suspended_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "user_reports" ADD COLUMN "handled_at" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "user_reports_handled_at_idx" ON "user_reports"("handled_at");
