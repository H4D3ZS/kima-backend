/*
  Warnings:

  - The primary key for the `Section` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Ticket` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[jobPostingId,title]` on the table `Section` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[eventId,title]` on the table `Ticket` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `id` to the `Section` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `Ticket` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `User_email_idx` ON `User`;

-- AlterTable
ALTER TABLE `Section` DROP PRIMARY KEY,
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `Ticket` DROP PRIMARY KEY,
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- CreateIndex
CREATE UNIQUE INDEX `Section_jobPostingId_title_key` ON `Section`(`jobPostingId`, `title`);

-- CreateIndex
CREATE UNIQUE INDEX `Ticket_eventId_title_key` ON `Ticket`(`eventId`, `title`);
