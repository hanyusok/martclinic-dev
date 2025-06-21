/*
  Warnings:

  - You are about to drop the column `firstName` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `Patient` table. All the data in the column will be lost.
  - Added the required column `fullName` to the `Patient` table without a default value. This is not possible if the table is not empty.

*/
-- 1. Add fullName as nullable
ALTER TABLE "Patient" ADD COLUMN "fullName" TEXT;

-- 2. Populate fullName with firstName + ' ' + lastName
UPDATE "Patient" SET "fullName" = "firstName" || ' ' || "lastName";

-- 3. Make fullName NOT NULL
ALTER TABLE "Patient" ALTER COLUMN "fullName" SET NOT NULL;

-- 4. Drop firstName and lastName
ALTER TABLE "Patient" DROP COLUMN "firstName";
ALTER TABLE "Patient" DROP COLUMN "lastName";
