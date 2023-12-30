import type { Request, Response } from "express";
import express from "express";
import Error from "../../constants/error";
import {
  deleteFunction,
  errorHandler,
  responseHandler,
} from "../../helpers/utils";
import jwtMiddleware from "../../middlewares/jwt";
import {
  favoriteUser,
  getFavoritedBy,
  getFavorites,
  unfavoriteUser,
} from "./favoriteUser.model";

export const favoriteUserRouter = express.Router();

favoriteUserRouter.get("/", async (req: Request, res: Response) => {
  const userId: string = req.headers.idFromJWT.toString();
  try {
    const userFavorites = await getFavorites(userId);
    return responseHandler({ status: 200, body: userFavorites, res, req });
  } catch (error: any) {
    return errorHandler({ error, res, req });
  }
});

favoriteUserRouter.get("/by", async (req: Request, res: Response) => {
  const userId: string = req.headers.idFromJWT.toString();
  try {
    const user = await getFavoritedBy(userId);
    return responseHandler({ status: 200, body: user.favoritedBy, res, req });
  } catch (error: any) {
    return errorHandler({ error, res, req });
  }
});

favoriteUserRouter.post("/", async (req: Request, res: Response) => {
  const userId: string = req.headers.idFromJWT.toString();
  const favoriteUserId = req.body.profileId;

  if (userId === favoriteUserId)
    return responseHandler({
      status: 400,
      body: {
        message: `You cant favorite yourself`,
      },
      res,
      req,
    });

  try {
    const user = await favoriteUser({ userId, favoriteUserId });
    if (user)
      return responseHandler({
        status: 201,
        body: {
          message: `User ${user.favoriteUser.email} favorited`,
          data: user,
        },
        res,
        req,
      });
    else
      return responseHandler({
        ...Error.notFound,
        res,
        req,
      });
  } catch (error: any) {
    if (
      error.name === Error.prismaClientKnownRequestError &&
      error.code === "P2003"
    )
      return responseHandler({
        status: Error.notFound.status,
        body: {
          message: `${
            error.meta.field_name === "favoriteUserId"
              ? "profileId"
              : error.meta.field_name
          } ${Error.notFound.body.message}`,
        },
        res,
        req,
      });

    return errorHandler({ error, res, req });
  }
});

favoriteUserRouter.delete("/:id", (req, res) =>
  deleteFunction(req, res, unfavoriteUser, parseInt(req.params.id))
);
