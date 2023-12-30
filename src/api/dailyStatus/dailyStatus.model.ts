import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getDailyStatusList = async (
  userId: string,
  cursor: number | null
) => {
  console.log(cursor);
  return await prisma.dailyStatusFeed.findMany({
    where: { userId },
    select: {
      id: true,
      statusContent: true,
      oldStatusContent: true,
      updatedAt: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
    skip: cursor ? 1 : undefined,
    cursor: cursor ? { id: cursor } : undefined,
  });
};

export const createDailyStatus = async (body: {
  userId: string;
  statusContent: string;
}) => {
  const { userId, statusContent } = body;
  return await prisma.dailyStatusFeed.create({
    data: {
      userId,
      statusContent,
    },
    select: {
      id: true,
      statusContent: true,
    },
  });
};

export const updateDailyStatus = async (body: {
  id: number;
  statusContent: string;
}) => {
  const { id, statusContent } = body;

  const oldData = await prisma.dailyStatusFeed.findUnique({
    where: { id },
  });

  const oldStatusContent = oldData.statusContent;

  return await prisma.dailyStatusFeed.update({
    where: {
      id,
    },
    data: {
      id,
      statusContent,
      oldStatusContent,
    },
    select: {
      id: true,
      updatedAt: true,
      statusContent: true,
      oldStatusContent: true,
    },
  });
};

export const deleteDailyStatus = async (id: number) => {
  return await prisma.dailyStatusFeed.delete({
    where: {
      id,
    },
  });
};
