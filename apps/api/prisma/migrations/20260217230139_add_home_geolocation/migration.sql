-- CreateTable
CREATE TABLE "Home" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "latitude" DECIMAL(9,6) NOT NULL,
    "longitude" DECIMAL(9,6) NOT NULL,
    "capacity" INTEGER NOT NULL,
    "homeType" TEXT NOT NULL,
    "amenities" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Home_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Home_city_country_idx" ON "Home"("city", "country");

-- CreateIndex
CREATE INDEX "Home_latitude_longitude_idx" ON "Home"("latitude", "longitude");
