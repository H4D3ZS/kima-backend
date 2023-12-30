/*
  Warnings:

  - A unique constraint covering the columns `[link]` on the table `SocialMediaLink` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `oldStatusContent` to the `DailyStatusFeed` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `DailyStatusFeed` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `SocialMediaLink` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `DailyStatusFeed` ADD COLUMN `oldStatusContent` VARCHAR(191) NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `SocialMediaLink` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `SocialMediaLink_link_key` ON `SocialMediaLink`(`link`);
