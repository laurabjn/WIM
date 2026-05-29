-- CreateEnum
CREATE TYPE "VehicleFuelType" AS ENUM ('GASOLINE', 'HYBRID', 'DIESEL', 'ELECTRIC');

-- AlterTable
ALTER TABLE "vehicles" ADD COLUMN     "fuel_type" "VehicleFuelType";
