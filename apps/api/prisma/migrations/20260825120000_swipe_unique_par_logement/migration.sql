DROP INDEX IF EXISTS "Swipe_swiperId_targetUserId_key";

CREATE UNIQUE INDEX IF NOT EXISTS "Swipe_swiperId_homeId_key" ON "Swipe"("swiperId", "homeId");
