/*
  Warnings:

  - You are about to drop the column `carExchangeAccepted` on the `Home` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Home` table. All the data in the column will be lost.
  - You are about to drop the column `homeType` on the `Home` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Home` table. All the data in the column will be lost.
  - You are about to alter the column `latitude` on the `Home` table. The data in that column could be lost. The data in that column will be cast from `Decimal(9,6)` to `DoublePrecision`.
  - You are about to alter the column `longitude` on the `Home` table. The data in that column could be lost. The data in that column will be cast from `Decimal(9,6)` to `DoublePrecision`.
  - You are about to drop the column `homeId` on the `home_photos` table. All the data in the column will be lost.
  - Added the required column `home_type` to the `Home` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Home` table without a default value. This is not possible if the table is not empty.
  - Added the required column `home_id` to the `home_photos` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "home_photos" DROP CONSTRAINT "home_photos_homeId_fkey";

-- AlterTable
ALTER TABLE "Home" DROP COLUMN "carExchangeAccepted",
DROP COLUMN "createdAt",
DROP COLUMN "homeType",
DROP COLUMN "updatedAt",
ADD COLUMN     "car_exchange_accepted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "home_type" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "latitude" DROP NOT NULL,
ALTER COLUMN "latitude" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "longitude" DROP NOT NULL,
ALTER COLUMN "longitude" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "home_photos" DROP COLUMN "homeId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "home_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "home_photos" ADD CONSTRAINT "home_photos_home_id_fkey" FOREIGN KEY ("home_id") REFERENCES "Home"("id") ON DELETE CASCADE ON UPDATE CASCADE;
