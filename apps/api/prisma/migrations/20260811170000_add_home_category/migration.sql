-- CreateEnum
CREATE TYPE "HomeCategory" AS ENUM ('NATURE', 'BEACH', 'CITY', 'CULTURE');

-- AlterTable
ALTER TABLE "Home" ADD COLUMN "category" "HomeCategory";
