import type { Request, Response } from "express";
import express from "express";
import Error from "../../constants/error";
import {
  deleteFunction,
  errorHandler,
  responseHandler,
} from "../../helpers/utils";
import jwt from "../../middlewares/jwt";
import { deleteUser, getUser, getUsers, updateUser } from "./member.model";
import { getFromS3 } from "../../helpers/s3";

export const memberRouter = express.Router();

const updateLinks = async (user) => {
  const { coverPhoto, profileAvatar, ...data } = user;
  let coverPhotoLink = null;
  let profileAvatarLink = null;
  if (coverPhoto) coverPhotoLink = await getFromS3(coverPhoto);
  if (profileAvatar) profileAvatarLink = await getFromS3(profileAvatar);

  return {
    coverPhoto: coverPhotoLink,
    profileAvatar: profileAvatarLink,
    ...data,
  };
};

memberRouter.get("/", jwt, async (req: Request, res: Response) => {
  const { page, perPage, ...body } = req.query;
  try {
    const users = await getUsers(body, page, perPage);

    const usersWithLink = await users.data.map(async (user) =>
      updateLinks(user)
    );

    return responseHandler({
      status: 200,
      body: { ...users, data: await Promise.all(usersWithLink) },
      res,
      req,
    });
  } catch (error: any) {
    return errorHandler({ error, res, req });
  }
});

memberRouter.get("/:id", jwt, async (req: Request, res: Response) => {
  const id: string = req.params.id;
  try {
    const user = await getUser(id);
    if (user)
      return responseHandler({
        status: 200,
        body: await updateLinks(user),
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
    return errorHandler({ error, res, req });
  }
});

memberRouter.put("/", jwt, async (req: Request, res: Response) => {
  const id: string = req.headers.idFromJWT.toString();
  const { profileAvatar, coverPhoto, password, ...data } = req.body;
  try {
    const updatedUser = await updateUser({ id, ...data });
    if (updatedUser)
      return responseHandler({
        status: 200,
        body: {
          message: `User ${updatedUser.email} Updated`,
          data: updatedUser,
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
    return errorHandler({ error, res, req });
  }
});

memberRouter.delete("/", jwt, (req, res) =>
  deleteFunction(req, res, deleteUser)
);
