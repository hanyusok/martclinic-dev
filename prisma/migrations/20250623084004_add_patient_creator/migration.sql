-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "createdBy" TEXT;

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
