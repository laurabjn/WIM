-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "home_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reviews_home_id_idx" ON "reviews"("home_id");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_home_id_author_id_key" ON "reviews"("home_id", "author_id");

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_home_id_fkey" FOREIGN KEY ("home_id") REFERENCES "Home"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
