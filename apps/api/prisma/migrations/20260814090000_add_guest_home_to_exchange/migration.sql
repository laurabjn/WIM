-- AlterTable
ALTER TABLE "exchanges" ADD COLUMN "guest_home_id" TEXT;

-- AddForeignKey
ALTER TABLE "exchanges" ADD CONSTRAINT "exchanges_guest_home_id_fkey" FOREIGN KEY ("guest_home_id") REFERENCES "Home"("id") ON DELETE SET NULL ON UPDATE CASCADE;
