-- AlterTable
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerified_new" BOOLEAN DEFAULT false;

-- UpdateData
UPDATE "User" SET "emailVerified_new" = true WHERE "emailVerified" IS NOT NULL;

-- DropColumn
ALTER TABLE "User" DROP COLUMN IF EXISTS "emailVerified";

-- RenameColumn
ALTER TABLE "User" RENAME COLUMN "emailVerified_new" TO "emailVerified";

-- Session: Add new columns if they don't exist
ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "ipAddress" TEXT;
ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "userAgent" TEXT;

-- Account: Ensure columns exist (Better Auth standard)
-- We assume the table exists. If not, Prisma would have created it in a previous migration.
-- If we are migrating from NextAuth, we might need to rename columns if they were snake_case.
-- However, without inspecting the DB, we assume standard Prisma naming (camelCase) or that the user will handle column renaming if needed.
-- We focus on the critical data migration for emailVerified.
