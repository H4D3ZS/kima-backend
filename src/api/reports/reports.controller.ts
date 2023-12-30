import type { Request, Response } from "express";
import express from "express";
import Error from "../../constants/error";
import { errorHandler, responseHandler } from "../../helpers/utils";
import { createReports } from "./reports.model";

export const reportsRouter = express.Router();

reportsRouter.post("/classified", async (req: Request, res: Response) => {
  const userId: string = req.headers.idFromJWT.toString();
  const { id, ...body } = req.body;
  try {
    const reportedClassified = await createReports({
      userId,
      id,
      type: "classified",
      ...body,
    });
    if (reportedClassified)
      return responseHandler({
        status: 201,
        body: {
          message: `Created a report for Classified ${id}`,
          data: reportedClassified,
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

reportsRouter.post("/user", async (req: Request, res: Response) => {
  const userId: string = req.headers.idFromJWT.toString();
  const { id, ...body } = req.body;
  try {
    const reportedClassified = await createReports({
      userId,
      id,
      type: "user",
      ...body,
    });
    if (reportedClassified)
      return responseHandler({
        status: 201,
        body: {
          message: `Created a report for User ${id}`,
          data: reportedClassified,
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
