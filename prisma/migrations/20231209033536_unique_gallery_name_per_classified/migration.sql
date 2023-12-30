/*
  Warnings:

  - A unique constraint covering the columns `[imageUrl,classifiedId]` on the table `ClassifiedGallery` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `ClassifiedGallery_imageUrl_classifiedId_key` ON `ClassifiedGallery`(`imageUrl`, `classifiedId`);
