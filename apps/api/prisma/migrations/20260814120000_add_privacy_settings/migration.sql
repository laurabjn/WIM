-- AlterTable
ALTER TABLE "users" ADD COLUMN "profile_visible" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "show_age" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "data_sharing" BOOLEAN NOT NULL DEFAULT false;
