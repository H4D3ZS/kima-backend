import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createReports = async (body: {
  userId: string;
  id: string;
  reason: string;
  details?: string;
  type: "classified" | "user";
}) => {
  const { userId, id, reason, details, type } = body;
  const data = {
    userId,
    reason,
    details,
  };

  if (type === "classified")
    return await prisma.reportedClassified.create({
      data: { ...data, reportedClassifiedId: parseInt(id) },
    });
  else
    return await prisma.reportedUser.create({
      data: { ...data, reportedUserId: id },
    });
};
