-- CreateTable
CREATE TABLE "telegram_sources" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "chat_id" VARCHAR(255) NOT NULL,
    "chat_type" VARCHAR(50) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_message_id" INTEGER,
    "last_crawled_at" TIMESTAMP(3),
    "category_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "telegram_sources_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "telegram_sources_chat_id_key" ON "telegram_sources"("chat_id");

-- AddForeignKey
ALTER TABLE "telegram_sources" ADD CONSTRAINT "telegram_sources_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
