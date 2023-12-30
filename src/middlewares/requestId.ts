import { NextFunction, Request, Response } from "express";
import { v4 as uuid } from "uuid";

export default (
  req: Request & { requestId: string },
  res: Response,
  next: NextFunction
) => {
  req.requestId = uuid();
  next();
};
