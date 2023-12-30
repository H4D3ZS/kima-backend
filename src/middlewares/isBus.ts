import Errors from "../constants/error";
import { responseHandler } from "../helpers/utils";

export default async (req, res, next) => {
  const userType: string = req.headers.userTypeFromJWT.toString();
  if (userType === "business") {
    next();
  } else {
    return responseHandler({
      status: Errors.forbidden.status,
      body: {
        message:
          "member and professional userType " + Errors.forbidden.body.message,
      },
      res,
      req,
    });
  }
};
