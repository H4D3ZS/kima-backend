import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import log from "winston";
import { DEFAULTS, GENDER, USER_TYPES } from "../../constants/defaults";
import { deleteFromS3 } from "../../helpers/s3";

const prisma = new PrismaClient();

const encryptPassword = async (password: string) => {
  return await bcrypt
    .genSalt(DEFAULTS.salt_rounds)
    .then((salt) => {
      return bcrypt.hash(password, salt);
    })
    .then((hash) => {
      return hash;
    })
    .catch((err) => log.warn(err));
};

export const getUsers = async (body, page, perPage) => {
  const currentPage = page ? parseInt(page) : 1;
  const itemsPerPage = perPage ? parseInt(perPage) : 2;
  const skipCount = (currentPage - 1) * itemsPerPage;
  const {
    id,
    firstName,
    lastName,
    gender,
    birthDate,
    email,
    userType,
    contactNumber,
    location,
    userDescription,
    profileAvatar,
    coverPhoto,
    jobTitle,
    createdAt,
    updatedAt,
    nameUpdatedAt,
    socialMediaLinks,
    favoritedBy,
    userFavorites,
  } = body;
  try {
    const [data, totalItems] = await prisma.$transaction([
      prisma.user.findMany({
        where: {
          id,
          firstName,
          lastName,
          gender,
          birthDate,
          email,
          userType,
          contactNumber,
          location,
          userDescription,
          profileAvatar,
          coverPhoto,
          jobTitle,
          createdAt,
          updatedAt,
          nameUpdatedAt,
        },
        skip: skipCount,
        take: itemsPerPage,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          gender: true,
          birthDate: true,
          email: true,
          userType: true,
          contactNumber: true,
          location: true,
          userDescription: true,
          profileAvatar: true,
          coverPhoto: true,
          jobTitle: true,
          createdAt: true,
          updatedAt: true,
          nameUpdatedAt: true,
          socialMediaLinks: socialMediaLinks ? true : false,
          favoritedBy: favoritedBy
            ? {
                select: {
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
              }
            : false,
          userFavorites: userFavorites
            ? {
                select: {
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
              }
            : false,
        },
        orderBy: { id: "asc" },
      }),
      prisma.user.count({
        where: {
          id,
          firstName,
          lastName,
          gender,
          birthDate,
          email,
          userType,
          contactNumber,
          location,
          userDescription,
          profileAvatar,
          coverPhoto,
          jobTitle,
          createdAt,
          updatedAt,
          nameUpdatedAt,
        },
      }),
    ]);

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const response = {
      data,
      pageInfo: data.length
        ? {
            currentPage,
            totalPages,
            itemsPerPage,
            totalItems,
          }
        : undefined,
    };

    return response;
  } catch (error: any) {
    throw error;
  }
};

export const getUser = async (id: string) => {
  return await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
      gender: true,
      birthDate: true,
      nameUpdatedAt: true,
      firstName: true,
      lastName: true,
      email: true,
      userType: true,
      contactNumber: true,
      location: true,
      userDescription: true,
      profileAvatar: true,
      coverPhoto: true,
      jobTitle: true,
    },
  });
};

export const createUser = async (body: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  userType: (typeof USER_TYPES)[number];
  contactNumber?: string;
}) => {
  const { firstName, lastName, email, password, userType, contactNumber } =
    body;

  return await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      password: await encryptPassword(password),
      userType,
      contactNumber,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    },
  });
};

export const updateUser = async (body: {
  id: string;
  firstName?: string;
  middleName?: string;
  gender?: (typeof GENDER)[number];
  birthDate?: string;
  lastName?: string;
  userType?: (typeof USER_TYPES)[number];
  contactNumber?: string;
  location?: string;
  userDescription?: string;
  jobTitle?: string;
  profileAvatar?: string;
  coverPhoto?: string;
  email?: string;
  password?: string;
}) => {
  const { id, ...data } = body;

  const newData: typeof data & { nameUpdatedAt?: Date } = structuredClone(data);

  if (data.firstName || data.middleName || data.lastName) {
    newData.nameUpdatedAt = new Date();
  }

  const updatedUser = await prisma.user.update({
    where: {
      id,
    },
    data: { ...newData },
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
      nameUpdatedAt: true,
      firstName: true,
      lastName: true,
      gender: true,
      birthDate: true,
      email: true,
      userType: true,
      contactNumber: true,
      location: true,
      userDescription: true,
      profileAvatar: true,
      coverPhoto: true,
      jobTitle: true,
    },
  });

  if (newData.coverPhoto === null) {
    deleteFromS3(updatedUser.coverPhoto);
  }

  if (newData.profileAvatar === null) {
    deleteFromS3(updatedUser.profileAvatar);
  }

  return updatedUser;
};

export const updateMemberType = async (type: string, id: string) => {
  return await prisma.user.update({
    where: { id },
    data: {
      userType: type as (typeof USER_TYPES)[number],
    },
    select: {
      email: true,
    },
  });
};

export const deleteUser = async (body: { userId: string; token: string }) => {
  const { userId, token } = body;
  try {
    const deletedUser = await prisma.$transaction([
      prisma.blacklistedToken.create({
        data: {
          token,
        },
      }),
      prisma.user.delete({
        where: {
          id: userId,
        },
      }),
    ]);

    if (deletedUser[1].coverPhoto)
      await deleteFromS3(deletedUser[1].coverPhoto);
    if (deletedUser[1].profileAvatar)
      await deleteFromS3(deletedUser[1].profileAvatar);

    return deletedUser;
  } catch (error: any) {
    throw error;
  }
};
