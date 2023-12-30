"use strict";

const daily = require("winston-daily-rotate-file");
const config = require("config");
const winston = require("winston");
const moment = require("moment");

const stamp = () => moment.utc().format("YYYY-MM-DD HH:mm:ss:SSS[ms]");

// remove default
// then replace with a better one
winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {
  level: config.APP.LOG_LEVEL || "silly",
  colorize: true,
  prettyPrint: true,
  timestamp: stamp,
});

// handle error logs
winston.add(winston.transports.File, {
  dirname: config.APP.LOGS_DIR,
  filename: "error.log",
  timestamp: stamp,
  colorize: false,
  level: "warn",
  json: false,
  maxFiles: "10d",
});

// handles access logs
export default new winston.Logger({
  transports: [
    new daily({
      formatter: (a) => a.message.trim(),
      dirname: config.APP.LOGS_DIR,
      filename: "access",
      colorize: false,
      json: false,
      maxFiles: "10d",
    }),
  ],
});
