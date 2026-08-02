-- CreateEnum
CREATE TYPE "DigestFrequency" AS ENUM ('EVERY_3_DAYS', 'WEEKLY');

-- CreateTable
CREATE TABLE "user_category_subscriptions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_category_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_notification_settings" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "digest_frequency" "DigestFrequency" NOT NULL DEFAULT 'EVERY_3_DAYS',
    "generic_email_opt_out" BOOLEAN NOT NULL DEFAULT false,
    "last_digest_sent_at" TIMESTAMP(3),
    "last_generic_sent_at" TIMESTAMP(3),

    CONSTRAINT "user_notification_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_category_subscriptions_user_id_category_id_key" ON "user_category_subscriptions"("user_id", "category_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_notification_settings_user_id_key" ON "user_notification_settings"("user_id");

-- AddForeignKey
ALTER TABLE "user_category_subscriptions" ADD CONSTRAINT "user_category_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_category_subscriptions" ADD CONSTRAINT "user_category_subscriptions_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_notification_settings" ADD CONSTRAINT "user_notification_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
