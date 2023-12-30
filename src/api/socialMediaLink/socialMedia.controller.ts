import type { Request, Response } from "express";
import express from "express";
import Error from "../../constants/error";
import {
  deleteFunction,
  errorHandler,
  responseHandler,
} from "../../helpers/utils";
import {
  createLink,
  deleteLink,
  getLinks,
  updateLink,
} from "./socialMedia.model";

export const socialMediaLinksRouter = express.Router();
socialMediaLinksRouter.get("/", async (req: Request, res: Response) => {
  const userId: string = req.headers.idFromJWT.toString();
  try {
    const userFavorites = await getLinks(userId);
    return responseHandler({ status: 200, body: userFavorites, res, req });
  } catch (error: any) {
    return errorHandler({ error, res, req });
  }
});

socialMediaLinksRouter.post("/", async (req: Request, res: Response) => {
  const userId: string = req.headers.idFromJWT.toString();
  const { link } = req.body;
  try {
    const user = await createLink({ userId, link });
    if (user)
      return responseHandler({
        status: 201,
        body: {
          message: `Social Link ${user.link} Added`,
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
    return errorHandler({ error, res, req });
  }
});
socialMediaLinksRouter.put("/:id", async (req: Request, res: Response) => {
  const id: number = parseInt(req.params.id);
  const { link } = req.body;
  try {
    const updatedLink = await updateLink({ id, link });
    if (updatedLink)
      return responseHandler({
        status: 200,
        body: {
          message: `Link updated to ${updatedLink.link}`,
          data: updatedLink,
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
socialMediaLinksRouter.delete("/:id", (req, res) =>
  deleteFunction(req, res, deleteLink, parseInt(req.params.id))
);
