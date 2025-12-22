-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Role" ADD VALUE 'SUPPORT';
ALTER TYPE "Role" ADD VALUE 'ORGANIZER';

-- AlterTable
ALTER TABLE "events" ALTER COLUMN "location" DROP NOT NULL,
ALTER COLUMN "venue" DROP NOT NULL,
ALTER COLUMN "end_date" DROP NOT NULL;
