import { Prisma, PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { DEFAULTS } from "../src/constants/defaults";
const prisma = new PrismaClient();

const seed = async () => {
  const salt = await bcrypt.genSalt(DEFAULTS.salt_rounds);
  const users = [
    {
      firstName: "John",
      lastName: "Pro",
      email: "johnpro@gmail.com",
      password: await bcrypt.hash("johnpro1", salt),
      userType: "professional",
    },
    {
      firstName: "John",
      lastName: "Member",
      email: "johnmember@gmail.com",
      password: await bcrypt.hash("johnmember", salt),
      userType: "member",
    },
    {
      firstName: "John",
      lastName: "Business",
      email: "johnbusiness@gmail.com",
      password: await bcrypt.hash("johnbusiness", salt),
      userType: "business",
    },
  ];

  await prisma.$transaction(
    users.map((user) =>
      prisma.user.upsert({
        where: { email: user.email },
        update: user as Prisma.UserCreateInput,
        create: user as Prisma.UserCreateInput,
      })
    )
  );
};

seed();
