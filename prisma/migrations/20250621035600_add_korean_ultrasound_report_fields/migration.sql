-- CreateEnum
CREATE TYPE "ExaminationType" AS ENUM ('GENERAL', 'DETAILED', 'LIMITED');

-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "patientNumber" TEXT;

-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "bileDuctDilation" TEXT,
ADD COLUMN     "examinationType" "ExaminationType" NOT NULL DEFAULT 'GENERAL',
ADD COLUMN     "gallbladderAbnormal" TEXT,
ADD COLUMN     "institutionAddress" TEXT,
ADD COLUMN     "institutionName" TEXT,
ADD COLUMN     "institutionPhone" TEXT,
ADD COLUMN     "interpretationDate" TIMESTAMP(3),
ADD COLUMN     "liverEcho" TEXT,
ADD COLUMN     "liverMass" TEXT,
ADD COLUMN     "pancreasAbnormal" TEXT,
ADD COLUMN     "spleenEnlargement" TEXT,
ALTER COLUMN "findings" DROP NOT NULL,
ALTER COLUMN "impression" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "licenseNumber" TEXT;
