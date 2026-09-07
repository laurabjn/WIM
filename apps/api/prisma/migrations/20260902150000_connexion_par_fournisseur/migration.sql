CREATE TYPE "AuthProvider" AS ENUM ('GOOGLE', 'APPLE');

CREATE TABLE "auth_identities" (
    "id" TEXT NOT NULL,
    "provider" "AuthProvider" NOT NULL,
    "provider_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_identities_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "auth_identities_provider_provider_id_key" ON "auth_identities"("provider", "provider_id");

CREATE INDEX "auth_identities_user_id_idx" ON "auth_identities"("user_id");

ALTER TABLE "auth_identities" ADD CONSTRAINT "auth_identities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
