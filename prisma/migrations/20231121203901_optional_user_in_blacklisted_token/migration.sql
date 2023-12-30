-- DropForeignKey
ALTER TABLE `BlacklistedToken` DROP FOREIGN KEY `BlacklistedToken_userId_fkey`;

-- AlterTable
ALTER TABLE `BlacklistedToken` MODIFY `userId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `BlacklistedToken` ADD CONSTRAINT `BlacklistedToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
