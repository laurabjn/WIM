-- CreateEnum
CREATE TYPE "IdentityStatus" AS ENUM ('NOT_VERIFIED', 'IN_PROGRESS', 'VERIFIED', 'REFUSED');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "identityStatus" "IdentityStatus" NOT NULL DEFAULT 'NOT_VERIFIED';
