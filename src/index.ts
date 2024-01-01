import compression from "compression";
import { APP } from "config";
import cors from "cors";
import express, { Request, Response } from "express";
import methodOverride from "method-override";
import morgan from "morgan";
import requestParam from "request-param";
import logger from "winston";
import { authRouter } from "./api/auth/auth.controller";
import { dailyStatusRouter } from "./api/dailyStatus/dailyStatus.controller";
import { devToolsRouter } from "./api/devTools/devTools.controller";
import { favoriteUserRouter } from "./api/favoriteUser/favoriteUser.controller";
import { memberRouter } from "./api/member/member.controller";
import { socialMediaLinksRouter } from "./api/socialMediaLink/socialMedia.controller";
import Error from "./constants/error";
import initLogger from "./helpers/logger.js";
import { isDev, responseHandler } from "./helpers/utils";
import jwt from "./middlewares/jwt";
import requestId from "./middlewares/requestId";
import swaggerDocs from "./utils/swagger";
import isProBus from "./middlewares/isProBus";
import { uploadRouter } from "./api/upload/upload.controller";
import { signUpRouter } from "./api/member/signUpController";
import { classifiedRouter } from "./api/classified/classified.controller";
import { webhookRouter } from "./api/member/webhookRouter";
import path from "path";
import { chatRouter } from "./api/chat/chat.controller";
import { reportsRouter } from "./api/reports/reports.controller";


// const corsOptions = {
//   // origin: ["    http://localhost:3000", "https://www.kimaapp.com"],

   
//   methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
//   credentials: true,
//   optionsSuccessStatus: 204,
// };

const corsOptions = {
  origin: ['*Access-Control-Allow-Origin', 'Access-Control-Allow-Origin', 'http://localhost:3000', 'http://localhost:5000'], // Allow all origins
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};

const app = express();
app.set("env", APP.ENV);
logger.info("Starting", APP.APP_NAME, "on", APP.ENV, "environment");

app.use(cors(corsOptions));
app.use(requestId);
app.use(compression());

app.use("/webhooks", express.raw({ type: "application/json" }), webhookRouter);
app.use(express.json());
app.use(methodOverride());
app.set("x-powered-by", false);
app.set("case sensitive routing", true);
app.use(requestParam({ order: ["body", "query", "params"] }));
app.use(morgan("combined", { stream: { write: initLogger.info } }));
app.use(
  morgan(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, "content-length"),
      "-",
      tokens["response-time"](req, res),
      "ms",
    ].join(" ");
  })
);

// Dev Routes
if (isDev) {
  swaggerDocs(app);
  app.use("/dev-tools", devToolsRouter);
}

// Routes
app.use("/auth", authRouter);
app.use("/healthcheck", (req: Request, res: Response) => {
  res.status(200);
  res.json({ message: "OK" });
});
app.use("/members/favorite", jwt, favoriteUserRouter);
app.use("/members/upload", jwt, uploadRouter);
app.use("/members/social-media-links", [jwt, isProBus], socialMediaLinksRouter);
app.use("/members/daily-status", [jwt, isProBus], dailyStatusRouter);
app.use("/classifieds", [jwt, isProBus], classifiedRouter);
app.use("/reports", jwt, reportsRouter);
app.use("/members", signUpRouter);
app.use("/members", memberRouter);

// Serve the assetlinks.json file
app.get("/.well-known/assetlinks.json", (req, res) => {
  const filePath = path.join(__dirname, "..", "assetlinks.json");
  res.sendFile(filePath);
});

// Serve the apple-app-site-association.json file
app.get("/.well-known/apple-app-site-association.json", (req, res) => {
  const filePath = path.join(__dirname, "..", "apple-app-site-association.json");
  res.sendFile(filePath);
});

// Chat
app.use("/chat", jwt, chatRouter);

app.all("*", (req, res) => {
  responseHandler({
    ...Error.notFound,
    res,
    req,
  });
});

// Start App
app.listen(APP.PORT, () => {
  logger.info("Server listening on port", APP.PORT);
});