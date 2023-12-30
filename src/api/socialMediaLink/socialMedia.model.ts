import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getLinks = async (userId: string) => {
  return await prisma.socialMediaLink.findMany({
    where: { userId },
    select: {
      id: true,
      link: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const createLink = async (body: { userId: string; link: string }) => {
  const { userId, link } = body;
  return await prisma.socialMediaLink.create({
    data: {
      userId,
      link,
    },
    select: {
      id: true,
      link: true,
    },
  });
};

export const updateLink = async (body: { id: number; link: string }) => {
  const { id, link } = body;

  return await prisma.socialMediaLink.update({
    where: {
      id,
    },
    data: { link },
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
      link: true,
    },
  });
};

export const deleteLink = async (id: number) => {
  return await prisma.socialMediaLink.delete({
    where: {
      id,
    },
  });
};
