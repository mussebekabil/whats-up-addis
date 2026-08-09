-- CreateEnum
CREATE TYPE "CategoryApplies" AS ENUM ('EVENT', 'PLACE', 'BOTH');

-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "applies" "CategoryApplies" NOT NULL DEFAULT 'EVENT';

-- CreateTable
CREATE TABLE "places" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image_url" TEXT,
    "category_id" TEXT NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "places_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "place_ratings" (
    "id" TEXT NOT NULL,
    "rating" SMALLINT NOT NULL,
    "place_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "place_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "place_comments" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "place_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "parent_comment_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "place_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "place_comment_likes" (
    "id" TEXT NOT NULL,
    "comment_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "place_comment_likes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "places_slug_key" ON "places"("slug");

-- CreateIndex
CREATE INDEX "place_ratings_place_id_idx" ON "place_ratings"("place_id");

-- CreateIndex
CREATE INDEX "place_ratings_user_id_idx" ON "place_ratings"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "place_ratings_place_id_user_id_key" ON "place_ratings"("place_id", "user_id");

-- CreateIndex
CREATE INDEX "place_comments_place_id_idx" ON "place_comments"("place_id");

-- CreateIndex
CREATE INDEX "place_comments_user_id_idx" ON "place_comments"("user_id");

-- CreateIndex
CREATE INDEX "place_comments_parent_comment_id_idx" ON "place_comments"("parent_comment_id");

-- CreateIndex
CREATE INDEX "place_comment_likes_comment_id_idx" ON "place_comment_likes"("comment_id");

-- CreateIndex
CREATE INDEX "place_comment_likes_user_id_idx" ON "place_comment_likes"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "place_comment_likes_comment_id_user_id_key" ON "place_comment_likes"("comment_id", "user_id");

-- AddForeignKey
ALTER TABLE "places" ADD CONSTRAINT "places_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "place_ratings" ADD CONSTRAINT "place_ratings_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "places"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "place_ratings" ADD CONSTRAINT "place_ratings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "place_comments" ADD CONSTRAINT "place_comments_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "places"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "place_comments" ADD CONSTRAINT "place_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "place_comments" ADD CONSTRAINT "place_comments_parent_comment_id_fkey" FOREIGN KEY ("parent_comment_id") REFERENCES "place_comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "place_comment_likes" ADD CONSTRAINT "place_comment_likes_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "place_comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "place_comment_likes" ADD CONSTRAINT "place_comment_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
