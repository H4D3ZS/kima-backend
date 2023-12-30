/*
  Warnings:

  - The primary key for the `Classified` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Classified` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - The primary key for the `Event` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Event` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - The primary key for the `ForSale` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `ForSale` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - The primary key for the `JobPosting` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `JobPosting` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - The primary key for the `Section` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `jobPostingId` on the `Section` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - The primary key for the `Ticket` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `eventId` on the `Ticket` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - A unique constraint covering the columns `[link,userId]` on the table `SocialMediaLink` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `Event` DROP FOREIGN KEY `Event_id_fkey`;

-- DropForeignKey
ALTER TABLE `ForSale` DROP FOREIGN KEY `ForSale_id_fkey`;

-- DropForeignKey
ALTER TABLE `JobPosting` DROP FOREIGN KEY `JobPosting_id_fkey`;

-- DropForeignKey
ALTER TABLE `Section` DROP FOREIGN KEY `Section_jobPostingId_fkey`;

-- DropForeignKey
ALTER TABLE `Ticket` DROP FOREIGN KEY `Ticket_eventId_fkey`;

-- DropIndex
DROP INDEX `SocialMediaLink_link_key` ON `SocialMediaLink`;

-- AlterTable
ALTER TABLE `Classified` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `Event` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `ForSale` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `JobPosting` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `Section` DROP PRIMARY KEY,
    MODIFY `jobPostingId` INTEGER NOT NULL,
    ADD PRIMARY KEY (`title`, `jobPostingId`);

-- AlterTable
ALTER TABLE `Ticket` DROP PRIMARY KEY,
    MODIFY `eventId` INTEGER NOT NULL,
    ADD PRIMARY KEY (`title`, `eventId`);

-- CreateTable
CREATE TABLE `ClassifiedGallery` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `imageUrl` VARCHAR(191) NOT NULL,
    `classifiedId` INTEGER NOT NULL,

    INDEX `ClassifiedGallery_classifiedId_fkey`(`classifiedId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ClassifiedFavorite` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` VARCHAR(191) NOT NULL,
    `classifiedId` INTEGER NOT NULL,

    UNIQUE INDEX `ClassifiedFavorite_userId_classifiedId_key`(`userId`, `classifiedId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `SocialMediaLink_link_userId_key` ON `SocialMediaLink`(`link`, `userId`);

-- AddForeignKey
ALTER TABLE `ClassifiedGallery` ADD CONSTRAINT `ClassifiedGallery_classifiedId_fkey` FOREIGN KEY (`classifiedId`) REFERENCES `Classified`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Event` ADD CONSTRAINT `Event_id_fkey` FOREIGN KEY (`id`) REFERENCES `Classified`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ticket` ADD CONSTRAINT `Ticket_eventId_fkey` FOREIGN KEY (`eventId`) REFERENCES `Event`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ForSale` ADD CONSTRAINT `ForSale_id_fkey` FOREIGN KEY (`id`) REFERENCES `Classified`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobPosting` ADD CONSTRAINT `JobPosting_id_fkey` FOREIGN KEY (`id`) REFERENCES `Classified`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Section` ADD CONSTRAINT `Section_jobPostingId_fkey` FOREIGN KEY (`jobPostingId`) REFERENCES `JobPosting`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClassifiedFavorite` ADD CONSTRAINT `ClassifiedFavorite_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClassifiedFavorite` ADD CONSTRAINT `ClassifiedFavorite_classifiedId_fkey` FOREIGN KEY (`classifiedId`) REFERENCES `Classified`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
