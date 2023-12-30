import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getCredentials = async (data: { email: string }) => {
  const { email } = data;
  return await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
      firstName: true,
      lastName: true,
      email: true,
      userType: true,
      contactNumber: true,
      location: true,
      userDescription: true,
      password: true,
      profileAvatar: true,
      coverPhoto: true,
      jobTitle: true,
    },
  });
};

export const blackListToken = async (data: {
  token: string;
  userId: string;
}) => {
  const { token, userId } = data;
  return await prisma.blacklistedToken.create({
    data: {
      token,
      userId,
    },
  });
};

export const isBlackListed = async (data: { token: string }) => {
  const { token } = data;
  return await prisma.blacklistedToken.findFirst({
    where: { token },
  });
};
