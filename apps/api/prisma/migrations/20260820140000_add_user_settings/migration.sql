ALTER TABLE "users" ADD COLUMN "notify_push" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "users" ADD COLUMN "notify_exchanges" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "users" ADD COLUMN "notify_sms" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN "marketing_emails" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN "show_precise_location" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "users" ADD COLUMN "allow_messages" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "users" ADD COLUMN "distance_unit" TEXT NOT NULL DEFAULT 'km';
