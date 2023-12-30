import { TEST_USER } from "config";
import type { Request, Response } from "express";
import express from "express";
import { responseHandler } from "../../helpers/utils";
import admin from "../../utils/firebase";

export const devToolsRouter = express.Router();

devToolsRouter.get("/getCustomToken/:uid", async (req: Request, res: Response) => {
  const uid = req.params.uid;
  await admin
    .auth()
    .createCustomToken(uid ? uid : TEST_USER)
    .then((token) => {
      return responseHandler({ status: 200, body: token, res, req });
    });
});
