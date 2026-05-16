-- AlterTable
ALTER TABLE "Home" ADD COLUMN     "carExchangeAccepted" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "home_photos" (
    "id" TEXT NOT NULL,
    "homeId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "home_photos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Home" ADD CONSTRAINT "Home_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "home_photos" ADD CONSTRAINT "home_photos_homeId_fkey" FOREIGN KEY ("homeId") REFERENCES "Home"("id") ON DELETE CASCADE ON UPDATE CASCADE;
