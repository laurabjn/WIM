-- AlterTable
ALTER TABLE "Home" ADD COLUMN     "average_rating" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "bedrooms" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "is_available_for_exchange" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "price_per_night" INTEGER,
ADD COLUMN     "reviews_count" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "rating" INTEGER NOT NULL DEFAULT 0;
