-- CreateEnum
CREATE TYPE "SwipeDirection" AS ENUM ('LIKE', 'DISLIKE');

-- CreateTable
CREATE TABLE "Swipe" (
    "id" TEXT NOT NULL,
    "swiperId" TEXT NOT NULL,
    "targetUserId" TEXT NOT NULL,
    "direction" "SwipeDirection" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Swipe_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Swipe_swiperId_targetUserId_key" ON "Swipe"("swiperId", "targetUserId");

-- AddForeignKey
ALTER TABLE "Swipe" ADD CONSTRAINT "Swipe_swiperId_fkey" FOREIGN KEY ("swiperId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Swipe" ADD CONSTRAINT "Swipe_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
