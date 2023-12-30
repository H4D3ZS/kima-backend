import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export const getFavorites = async (userId: string) => {
  return await prisma.userFavorite.findMany({
    where: { userId },
    select: {
      id: true,
      createdAt: true,
      favoriteUser: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          profileAvatar: true,
          dailyStatusFeeds: {
            orderBy: {
              updatedAt: "desc",
            },
            take: 1,
          },
        },
      },
    },
  });
};

export const getFavoritedBy = async (id: string) => {
  return await prisma.user.findUnique({
    where: { id },
    select: {
      favoritedBy: {
        include: {
          favoriteUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              profileAvatar: true,
            },
          },
        },
      },
    },
  });
};

export const favoriteUser = async (data: {
  userId: string;
  favoriteUserId: string;
}) => {
  const { userId, favoriteUserId } = data;
  return await prisma.userFavorite.create({
    data: {
      userId,
      favoriteUserId,
    },
    select: {
      id: true,
      favoriteUser: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          profileAvatar: true,
        },
      },
    },
  });
};

export const unfavoriteUser = async (id: number) => {
  return await prisma.userFavorite.delete({
    where: {
      id,
    },
  });
};
