import type { Request, Response } from "express";
import express from "express";
import {
  errorHandler,
  responseHandler,
  uploadFunction,
} from "../../helpers/utils";
import isBus from "../../middlewares/isBus";
import { fileUpload } from "../../middlewares/upload";
import { updateUser } from "../member/member.model";
import Error from "../../constants/error";

export const uploadRouter = express.Router();

uploadRouter.post(
  "/avatar",
  fileUpload,
  async (req: Request & { file: any }, res: Response) =>
    uploadFunction(
      "avatar",
      { crop: { height: 360, width: 360 }, size: { height: 512, width: 512 } },
      req,
      res
    ).then(async () => {
      const id: string = req.headers.idFromJWT.toString();

      try {
        const updatedUser = await updateUser({
          id,
          profileAvatar: req.file.fileName,
        });
        if (updatedUser)
          return responseHandler({
            status: 200,
            body: { message: "Profile Avatar Updated" },
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
    })
);

uploadRouter.post(
  "/cover",
  fileUpload,
  async (req: Request & { file: any }, res: Response) =>
    uploadFunction(
      "cover",
      { size: { height: 720, width: 1280 }, crop: { height: 312, width: 820 } },
      req,
      res
    ).then(async () => {
      const id: string = req.headers.idFromJWT.toString();

      try {
        const updatedUser = await updateUser({
          id,
          coverPhoto: req.file.fileName,
        });
        if (updatedUser)
          return responseHandler({
            status: 200,
            body: { message: "Cover Photo Updated" },
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
    })
);
