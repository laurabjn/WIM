ALTER TABLE "users" ADD COLUMN "student_email" TEXT;
ALTER TABLE "users" ADD COLUMN "student_verified_until" TIMESTAMP(3);

CREATE TABLE "student_verifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "code_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_verifications_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "student_verifications_user_id_key" ON "student_verifications"("user_id");

ALTER TABLE "student_verifications" ADD CONSTRAINT "student_verifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
