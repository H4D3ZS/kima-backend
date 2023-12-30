import bcrypt from "bcrypt";
import type { Request, Response } from "express";
import express from "express";
import Error from "../../constants/error";
import { sign } from "../../helpers/jwt";
import { errorHandler, responseHandler } from "../../helpers/utils";
import jwtMiddleware from "../../middlewares/jwt";
import firebaseAdmin from "../../utils/firebase";
import { createUser } from "../member/member.model";
import { blackListToken, getCredentials } from "./auth.model";

export const authRouter = express.Router();

/**
 * * POST Methods
 */
authRouter.post("/login", async (req: Request, res: Response) => {
  const getFirebaseDetails = async (token) => {
    let data = {
      email: "",
      lastName: "",
      firstName: "",
      password: "",
      profileAvatar: "",
    };
    try {
      const { email, name, picture, uid, firebase, auth_time } =
        await firebaseAdmin.auth().verifyIdToken(token);

      if (Object.keys(firebase.identities).length > 0) {
        const fullName = name ? name.split(" ") : "Set Your Name".split(" ");
        data.email = email;
        if (fullName.length > 1) {
          data.lastName = fullName.pop();
          data.firstName = fullName.join(" ");
        } else {
          data.firstName = fullName.pop();
          data.lastName = "";
        }
        data.password = uid + auth_time;
        data.profileAvatar = picture;
      }
      return data;
    } catch (error: any) {
      return errorHandler({ error, res, req });
    }
  };

  const createFirebaseUser = async (data) => {
    try {
      return await createUser(data);
    } catch (error: any) {
      return errorHandler({ error, res, req });
    }
  };

  try {
    const firebaseToken = req.headers["firebase-token"];
    const data = firebaseToken
      ? await getFirebaseDetails(firebaseToken)
      : req.body;

    let accountDetails = await getCredentials({
      email: data.email,
    });

    if (!accountDetails) {
      if (firebaseToken) {
        await createFirebaseUser(data).then(async (data: any) => {
          accountDetails = await getCredentials({ email: data.email });
        });
      } else
        return responseHandler({
          ...Error.notFound,
          res,
          req,
        });
    }

    if (!firebaseToken) {
      const is_correct_password = await bcrypt.compare(
        data.password,
        accountDetails.password
      );

      if (!is_correct_password) {
        return responseHandler({
          ...Error.unauthorized,
          res,
          req,
        });
      }
    }

    const { password, id, ...account } = accountDetails;

    const token = sign({ id, userType: account.userType });

    res.header("Authorization", `Bearer ${token}`);

    return responseHandler({
      status: 200,
      body: {
        message: "Successfully authorized member",
        data: { id, ...account },
      },
      res,
      req,
    });
  } catch (error: any) {
    if (error.code === "auth/argument-error") {
      return responseHandler({
        ...Error.invalidToken,
        res,
        req,
      });
    }
    return errorHandler({ error, res, req });
  }
});

authRouter.post(
  "/logout",
  jwtMiddleware,
  async (req: Request, res: Response) => {
    const token = req.headers.authorization.split(" ")[1];
    const userId = req.headers.idFromJWT.toString();
    try {
      const blackList = await blackListToken({ token, userId });
      if (blackList)
        return responseHandler({
          status: 200,
          body: { message: "Logout Successful" },
          res,
          req,
        });
    } catch (error: any) {
      return errorHandler({ error, res, req });
    }
  }
);
