/*
  Warnings:

  - Added the required column `itemCondition` to the `ForSale` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ForSale` ADD COLUMN `itemCondition` ENUM('used', 'new') NOT NULL;
