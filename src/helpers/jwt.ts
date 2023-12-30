import jwt from "jsonwebtoken";
import log from "winston";
import { JWT } from "config";
import { isBlackListed } from "../api/auth/auth.model";

export const sign = (payload) => {
  return jwt.sign(payload, JWT.SECRET, {
    algorithm: JWT.ALGO,
    expiresIn: JWT.EXPIRATION,
  });
};

export const verify = async (token) => {
  if (!token) {
    return new Error("Invalid Token");
  }
  const parsedToken = token.split(" ")[1];
  try {
    const existingBlacklist = await isBlackListed({ token: parsedToken });

    if (existingBlacklist) {
      return new Error("Blacklisted Token");
    }

    const decoded = await jwt.verify(parsedToken, JWT.SECRET, {
      algorithms: [JWT.ALGO],
    });

    return decoded;
  } catch (error) {
    log.error(error);

    return new Error("Invalid Token");
  }
};
