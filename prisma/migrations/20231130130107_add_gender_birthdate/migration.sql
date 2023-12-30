-- AlterTable
ALTER TABLE `User` ADD COLUMN `birthDate` DATETIME(3) NULL,
    ADD COLUMN `gender` ENUM('female', 'male', 'others', 'do_not_specify') NULL;
