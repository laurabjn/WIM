CREATE TABLE "city_images" (
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "images" JSONB NOT NULL,
    "fetched_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "city_images_pkey" PRIMARY KEY ("city","country")
);
