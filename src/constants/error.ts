export default {
  badRequest: {
    status: 400,
    body: { message: "Bad Request" },
  },
  tooLong: {
    status: 400,
    body: { message: "value is too long" },
  },
  foreignKey: {
    status: 400,
    body: { message: "Foreign key constraint failed on the field: " },
  },
  unauthorized: {
    status: 401,
    body: { message: "Unauthorized Access" },
  },
  forbidden: {
    status: 403,
    body: { message: "Forbidden Access" },
  },
  notFound: {
    status: 404,
    body: { message: "Not Found" },
  },
  alreadyExists: {
    status: 409,
    body: { message: "Already Exists" },
  },
  invalidToken: {
    status: 498,
    body: { message: "Invalid Token" },
  },
  internalServer: {
    status: 500,
    message: "Internal Server Error",
  },
  prismaClientValidationError: "PrismaClientValidationError",
  prismaClientKnownRequestError: "PrismaClientKnownRequestError",
};
