/*
  Warnings:

  - You are about to drop the column `patientNumber` on the `Patient` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Patient" DROP COLUMN "patientNumber",
ADD COLUMN     "recordNumber" TEXT;
