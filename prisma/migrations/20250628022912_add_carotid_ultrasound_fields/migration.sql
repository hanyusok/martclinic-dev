-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('ABDOMINAL', 'CAROTID');

-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "leftCarotidFlow" TEXT,
ADD COLUMN     "leftCarotidImt" TEXT,
ADD COLUMN     "leftCarotidPlaque" TEXT,
ADD COLUMN     "leftCarotidStenosis" TEXT,
ADD COLUMN     "reportType" "ReportType" NOT NULL DEFAULT 'ABDOMINAL',
ADD COLUMN     "rightCarotidFlow" TEXT,
ADD COLUMN     "rightCarotidImt" TEXT,
ADD COLUMN     "rightCarotidPlaque" TEXT,
ADD COLUMN     "rightCarotidStenosis" TEXT;
