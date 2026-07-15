-- AlterTable
ALTER TABLE "RefreshToken" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "updatedAt" DROP DEFAULT;
