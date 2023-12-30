import { APP } from "config";
import { Request, Response } from "express";
import sharp from "sharp";
import log from "winston";
import Error from "../constants/error";
import { getFromS3, uploadToS3 } from "./s3";

type ResponseHandler = {
  status: number;
  body: unknown;
  res: Response;
  req: Request & { requestId?: string };
};

type PrismaError = {
  error: any;
  res: Response;
  req: Request & { requestId?: string };
};

export const responseHandler = ({
  status,
  body,
  res,
  req,
}: ResponseHandler) => {
  if ((status >= 200 && status < 299) || (status >= 400 && status < 499)) {
    res.status(status);
    res.json(body);
    if (status > 399) {
      log.warn(
        JSON.stringify({
          status,
          error: body,
        })
      );
    }
  } else {
    log.error(
      JSON.stringify({
        requestId: req.requestId,
        status: Error.internalServer.status,
        error: body,
      })
    );
    res.status(Error.internalServer.status);
    res.json(
      isDev
        ? { error: body }
        : { requestId: req.requestId, message: Error.internalServer.message }
    );
  }
  return res;
};

export const errorHandler = ({ error, res, req }: PrismaError) => {
  log.error(error);
  switch (error.name) {
    case Error.prismaClientValidationError: {
      const firstIndex =
        error.message.search("Argument") != -1
          ? error.message.search("Argument")
          : error.message.search("Unknown argument");
      const message = error.message.substring(firstIndex, error.message.length);

      return responseHandler({
        status: Error.badRequest.status,
        body: { message },
        res,
        req,
      });
    }

    case Error.prismaClientKnownRequestError: {
      switch (error.code) {
        case "P2000": {
          return responseHandler({
            status: Error.tooLong.status,
            body: {
              message:
                "`" +
                error.meta.column_name +
                "` " +
                Error.tooLong.body.message,
            },
            res,
            req,
          });
        }
        case "P2002": {
          return responseHandler({
            status: Error.alreadyExists.status,
            body: {
              message:
                error.meta.target + " " + Error.alreadyExists.body.message,
            },
            res,
            req,
          });
        }
        case "P2003": {
          return responseHandler({
            status: Error.foreignKey.status,
            body: {
              message:
                Error.foreignKey.body.message + " " + error.meta.field_name,
            },
            res,
            req,
          });
        }
        case "P2025": {
          return responseHandler({
            status: Error.notFound.status,
            body: {
              message: error.meta.cause,
            },
            res,
            req,
          });
        }
      }
    }
    default: {
      return responseHandler({
        status: Error.internalServer.status,
        body: error,
        res,
        req,
      });
    }
  }
};

export const isDev = APP.ENV === "development";

export const deleteFunction = async (
  req: Request,
  res: Response,
  modelFunction,
  id?: number
) => {
  try {
    const users = await modelFunction(
      id
        ? id
        : {
            userId: req.headers.idFromJWT.toString(),
            token: req.headers["authorization"].split(" ")[1],
          }
    );
    if (users) return responseHandler({ status: 204, body: users, res, req });
    else
      return responseHandler({
        ...Error.notFound,
        res,
        req,
      });
  } catch (error: any) {
    return errorHandler({ error, res, req });
  }
};

export const uploadFunction = async (
  type: string,
  options,
  req,
  res,
  file?,
  fileName?: string
) => {
  const userId: string = req.headers.idFromJWT.toString();

  if (!req.file && !file) {
    return responseHandler({
      status: Error.badRequest.status,
      body: { message: "No file uploaded" },
      res,
      req,
    });
  }

  if (!file) req.file.fileName = `${type}/${fileName ? fileName : userId}.jpeg`;

  const resizedImage = await sharp(file ? file : req.file.buffer)
    .resize({ ...options.size, fit: "contain" })
    .resize({ ...options.crop, fit: "cover" })
    .jpeg({
      quality: 100,
      force: true,
    })
    .toBuffer();

  return await uploadToS3(
    file ? { fileName: `${type}/${fileName}.jpeg` } : req.file,
    resizedImage
  );
};

export const removeNullKeys = (obj) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== null)
  );
};
