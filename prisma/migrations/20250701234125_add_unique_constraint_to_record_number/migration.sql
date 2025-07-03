/*
  Warnings:

  - A unique constraint covering the columns `[recordNumber]` on the table `Patient` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Patient_recordNumber_key" ON "Patient"("recordNumber");
