-- DropIndex
DROP INDEX `BlacklistedToken_token_key` ON `BlacklistedToken`;

-- AlterTable
ALTER TABLE `BlacklistedToken` MODIFY `token` TEXT NOT NULL;

-- CreateIndex
CREATE INDEX `token` ON `BlacklistedToken`(`token`(690));
