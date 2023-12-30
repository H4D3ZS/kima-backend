import { APP } from "config";
import multer from "multer";
import { responseHandler } from "../helpers/utils";
import ErrorConstant from "../constants/error";

const maxFiles = parseInt(APP.FILE_LIMIT);
const maxFileSize = parseInt(APP.FILE_SIZE) * 1024 * 1024;

const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: any, cb: any) => {
  if (!file) return cb(new Error("Request must have `image` object"));

  const allowedFileTypes = /jpeg|jpg|png|gif/;
  const extname = file.originalname.toLowerCase().match(allowedFileTypes);
  const mimetype = file.mimetype.match(allowedFileTypes);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    const error = new Error(
      "Invalid file type. Allowed types: jpeg, jpg, png, gif"
    );
    return cb(error);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    files: maxFiles,
    fileSize: maxFileSize,
  },
});

export const fileUpload = (req, res, next) =>
  upload.single("image")(req, res, (err) => {
    if (err) {
      return responseHandler({
        status: ErrorConstant.badRequest.status,
        body: { message: err.message || "No file uploaded" },
        res,
        req,
      });
    }

    next();
  });

export const filesUpload = async (req, res, next) =>
  await upload.array("images", maxFiles)(req, res, (err) => {
    if (err) {
      console.log(err);
      return responseHandler({
        status: ErrorConstant.badRequest.status,
        body: { message: err.message || "No file uploaded" },
        res,
        req,
      });
    }

    return next();
  });
