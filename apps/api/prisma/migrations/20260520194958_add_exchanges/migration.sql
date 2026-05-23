-- CreateEnum
CREATE TYPE "ExchangeStatus" AS ENUM ('CURRENT', 'FUTURE', 'PAST', 'CANCELLED');

-- CreateTable
CREATE TABLE "exchanges" (
    "id" TEXT NOT NULL,
    "home_id" TEXT NOT NULL,
    "host_id" TEXT NOT NULL,
    "guest_id" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "travelers_count" INTEGER NOT NULL DEFAULT 1,
    "status" "ExchangeStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exchanges_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "exchanges" ADD CONSTRAINT "exchanges_home_id_fkey" FOREIGN KEY ("home_id") REFERENCES "Home"("id") ON DELETE CASCADE ON UPDATE CASCADE;
