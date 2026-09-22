ALTER TABLE "users" ADD COLUMN "stripe_customer_id" TEXT;

CREATE UNIQUE INDEX "users_stripe_customer_id_key" ON "users"("stripe_customer_id");
