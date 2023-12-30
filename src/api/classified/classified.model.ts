import { PrismaClient } from "@prisma/client";
import { CLASSIFIED_CATEGORIES, EVENT_TYPES } from "../../constants/defaults";
import { removeNullKeys } from "../../helpers/utils";
import { deleteFromS3, emptyBucket } from "../../helpers/s3";

const prisma = new PrismaClient();

export const getClassifieds = async (body, page, perPage) => {
  const currentPage = page ? parseInt(page) : 1;
  const itemsPerPage = perPage ? parseInt(perPage) : 2;
  const skipCount = (currentPage - 1) * itemsPerPage;
  const {
    id,
    createdAt,
    updatedAt,
    title,
    description,
    location,
    category,
    userId,
  } = body;

  const where = {
    id: typeof id === "object" ? id : parseInt(id),
    createdAt,
    updatedAt,
    title,
    description,
    location,
    category,
    userId,
  };

  try {
    const [data, totalItems] = await prisma.$transaction([
      prisma.classified.findMany({
        where,
        skip: skipCount,
        take: itemsPerPage,
        include: {
          eventDetails: {
            select: {
              eventType: true,
              date: true,
              time: true,
              tickets: {
                select: {
                  title: true,
                  price: true,
                },
              },
            },
          },
          forSaleDetails: {
            select: {
              itemCondition: true,
              price: true,
            },
          },
          jobPostingDetails: {
            select: {
              sections: {
                select: {
                  title: true,
                  description: true,
                },
              },
            },
          },
          gallery: { select: { id: true, imageUrl: true, createdAt: true } },
        },
      }),
      prisma.classified.count({
        where,
      }),
    ]);

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const response = {
      data: data.map((data) => removeNullKeys(data)),
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

export const getClassified = async (id: number) => {
  const classifiedCategory = await prisma.classified.findUnique({
    where: { id },
    select: {
      category: true,
    },
  });

  if (!classifiedCategory) return classifiedCategory;

  return await prisma.classified.findUnique({
    where: { id },
    include: {
      eventDetails: classifiedCategory.category ===
        CLASSIFIED_CATEGORIES[0] && {
        select: {
          eventType: true,
          date: true,
          time: true,
          tickets: {
            select: {
              title: true,
              price: true,
            },
          },
        },
      },
      forSaleDetails: classifiedCategory.category ===
        CLASSIFIED_CATEGORIES[1] && {
        select: {
          itemCondition: true,
          price: true,
        },
      },
      jobPostingDetails: classifiedCategory.category ===
        CLASSIFIED_CATEGORIES[2] && {
        select: {
          sections: {
            select: {
              title: true,
              description: true,
            },
          },
        },
      },
      gallery: { select: { id: true, imageUrl: true, createdAt: true } },
    },
  });
};

export const createClassified = async (body) => {
  const { id, ...data } = body;
  return await prisma.classified.create({
    data,
    select: {
      id: true,
      title: true,
      description: true,
      location: true,
      category: true,
      userId: true,
      eventDetails: {
        select: {
          eventType: true,
          date: true,
          time: true,
          tickets: {
            select: {
              title: true,
              price: true,
            },
          },
        },
      },
      forSaleDetails: {
        select: {
          itemCondition: true,
          price: true,
        },
      },
      jobPostingDetails: {
        select: {
          sections: {
            select: {
              title: true,
              description: true,
            },
          },
        },
      },
    },
  });
};

export const updateClassified = async (body) => {
  const {
    id,
    category,
    title,
    description,
    location,
    eventDetails,
    jobPostingDetails,
    forSaleDetails,
    gallery,
    ...data
  } = body;

  const classified = await prisma.classified.findUnique({
    where: { id },
    select: {
      category: true,
      gallery: {
        select: { id: true, imageUrl: true, createdAt: true },
      },
    },
  });

  if (!classified) return classified;

  const galleryForDelete = classified.gallery.filter(
    (element) => !gallery.some((element2) => element.id === element2.id)
  );

  galleryForDelete.map(({ imageUrl }) => {
    deleteFromS3(imageUrl);
  });

  return await prisma.classified.update({
    where: { id },
    data: {
      title,
      description,
      location,
      gallery: gallery
        ? {
            deleteMany: {
              NOT: gallery.map(({ id }) => ({ id })),
            },
          }
        : undefined,
      eventDetails:
        classified.category === CLASSIFIED_CATEGORIES[0] && eventDetails
          ? {
              update: {
                ...eventDetails,
                tickets: {
                  deleteMany:
                    eventDetails.eventType === EVENT_TYPES[0]
                      ? { NOT: eventDetails.tickets.map(({ id }) => ({ id })) }
                      : {},
                  upsert:
                    eventDetails.eventType === EVENT_TYPES[0]
                      ? eventDetails.tickets.map(({ id, title, price }) => ({
                          where: { id: id ? id : -1 },
                          create: { title, price },
                          update: { title, price },
                        }))
                      : [],
                },
              },
            }
          : undefined,
      forSaleDetails:
        classified.category === CLASSIFIED_CATEGORIES[1] && forSaleDetails
          ? {
              update: {
                ...forSaleDetails,
              },
            }
          : undefined,
      jobPostingDetails:
        classified.category === CLASSIFIED_CATEGORIES[2] && jobPostingDetails
          ? {
              update: {
                ...jobPostingDetails,
                sections: {
                  deleteMany: {
                    NOT: jobPostingDetails.sections.map(({ id }) => ({ id })),
                  },
                  upsert: jobPostingDetails.sections.map(
                    ({ id, title, description }) => ({
                      where: { id: id ? id : -1 },
                      create: { title, description },
                      update: { title, description },
                    })
                  ),
                },
              },
            }
          : undefined,
    },
    include: {
      gallery: {
        select: {
          id: true,
          imageUrl: true,
          createdAt: true,
        },
      },
      eventDetails:
        classified.category === CLASSIFIED_CATEGORIES[0]
          ? {
              select: {
                eventType: true,
                date: true,
                time: true,
                tickets: {
                  select: {
                    title: true,
                    price: true,
                  },
                },
              },
            }
          : false,
      forSaleDetails:
        classified.category === CLASSIFIED_CATEGORIES[1]
          ? {
              select: {
                itemCondition: true,
                price: true,
              },
            }
          : false,
      jobPostingDetails:
        classified.category === CLASSIFIED_CATEGORIES[2]
          ? {
              select: {
                sections: {
                  select: {
                    title: true,
                    description: true,
                  },
                },
              },
            }
          : false,
    },
  });
};

export const deleteClassified = async (id: number) => {
  const deletedClassified = await prisma.classified.delete({
    where: {
      id,
    },
    include: {
      gallery: {
        select: {
          imageUrl: true,
          createdAt: true,
        },
      },
    },
  });

  if (deletedClassified.gallery.length > 0) {
    await emptyBucket(`gallery/${deletedClassified.id}`);
  }

  return deletedClassified;
};

export const uploadGallery = async (body) => {
  const { id, gallery, ...data } = body;

  return await prisma.classified.update({
    where: { id },
    data: {
      gallery,
    },
    select: {
      gallery: {
        select: {
          id: true,
          imageUrl: true,
          createdAt: true,
        },
      },
    },
  });
};
