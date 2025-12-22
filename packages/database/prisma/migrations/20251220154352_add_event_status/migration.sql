-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- AlterTable
ALTER TABLE "events" ADD COLUMN "status" "EventStatus" NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE INDEX "events_status_idx" ON "events"("status");
