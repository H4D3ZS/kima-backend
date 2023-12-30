import type { Request, Response } from "express";
import express from "express";
import Error from "../../constants/error";
import {
  deleteFunction,
  errorHandler,
  responseHandler,
} from "../../helpers/utils";
import {
  createDailyStatus,
  deleteDailyStatus,
  getDailyStatusList,
  updateDailyStatus,
} from "./dailyStatus.model";

export const dailyStatusRouter = express.Router();

dailyStatusRouter.get("/:id?", async (req: Request, res: Response) => {
  const userId: string = req.params.id
    ? req.params.id
    : req.headers.idFromJWT.toString();
  const cursor: number = parseInt(req.query.cursor as string);

  try {
    console.log(req.params);
    const dailyStatusList = await getDailyStatusList(userId, cursor);
    return responseHandler({
      status: 200,
      body: { data: dailyStatusList },
      res,
      req,
    });
  } catch (error: any) {
    return errorHandler({ error, res, req });
  }
});

dailyStatusRouter.post("/", async (req: Request, res: Response) => {
  const userId: string = req.headers.idFromJWT.toString();
  const { statusContent } = req.body;
  try {
    const dailyStatus = await createDailyStatus({ userId, statusContent });
    if (dailyStatus)
      return responseHandler({
        status: 201,
        body: {
          message: `Created a daily status for ${userId}`,
          data: dailyStatus,
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

dailyStatusRouter.put("/:id", async (req: Request, res: Response) => {
  const id: number = parseInt(req.params.id);
  const { statusContent } = req.body;
  try {
    const updatedDailyStatus = await updateDailyStatus({ id, statusContent });
    if (updatedDailyStatus)
      return responseHandler({
        status: 200,
        body: {
          message: `Updated ${id} daily status`,
          data: updatedDailyStatus,
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
dailyStatusRouter.delete("/:id", (req, res) =>
  deleteFunction(req, res, deleteDailyStatus, parseInt(req.params.id))
);
