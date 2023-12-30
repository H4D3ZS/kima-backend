import Errors from "../constants/error";
import { responseHandler } from "../helpers/utils";

const jwtHelper = require("../helpers/jwt");

export default async (req, res, next) => {
  const jwtToken = req.headers["authorization"];

  if (!jwtToken) {
    return responseHandler({
      ...Errors.forbidden,
      res,
      req,
    });
  }

  const verifyToken = await jwtHelper.verify(jwtToken);

  if (verifyToken instanceof Error || !verifyToken) {
    return responseHandler({
      ...Errors.invalidToken,
      res,
      req,
    });
  } else {
    req.headers["idFromJWT"] = verifyToken.id;
    req.headers["userTypeFromJWT"] = verifyToken.userType;
  }

  next();
};
