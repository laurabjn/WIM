-- CreateEnum
CREATE TYPE "AvailabilityType" AS ENUM ('AVAILABLE', 'BLOCKED');

-- CreateTable
CREATE TABLE "home_availabilities" (
    "id" TEXT NOT NULL,
    "home_id" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "type" "AvailabilityType" NOT NULL DEFAULT 'AVAILABLE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "home_availabilities_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "home_availabilities" ADD CONSTRAINT "home_availabilities_home_id_fkey" FOREIGN KEY ("home_id") REFERENCES "Home"("id") ON DELETE CASCADE ON UPDATE CASCADE;
