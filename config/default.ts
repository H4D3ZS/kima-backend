import dotenv from "dotenv";
import path from "path";
import pkg from "../package.json";

dotenv.config();

const getFirebase = () => {
  const serviceAccount = {
    type: "",
    project_id: "",
    private_key_id: "",
    private_key: "",
    client_email: "",
    client_id: "",
    auth_uri: "",
    token_uri: "",
    auth_provider_x509_cert_url: "",
    client_x509_cert_url: "",
    universe_domain: "",
  };

  Object.keys(serviceAccount).map((key) => {
    serviceAccount[key] = process.env[`FIREBASE_${key}`];
  });

  return serviceAccount;
};

export default {
  APP: {
    VERSION: pkg.version,
    APP_NAME: pkg.name,
    HOST: process.env.HOST,
    PORT: process.env.PORT,
    LOGS_DIR: path.normalize(path.join(__dirname, "../logs")),
    ENV: "development",
    FILE_SIZE: process.env.FILE_SIZE,
    FILE_LIMIT: process.env.FILE_LIMIT,
  },

  AWS: {
    BUCKET_NAME: process.env.BUCKET_NAME,
    BUCKET_REGION: process.env.BUCKET_REGION,
    ACCESS_KEY: process.env.ACCESS_KEY,
    SECRET_ACCESS_KEY: process.env.SECRET_ACCESS_KEY,
  },

  JWT: {
    ALGO: process.env.JWT_ALGORITHM,
    SECRET: process.env.JWT_SECRET, // uuid
    EXPIRATION: process.env.JWT_EXPIRES_IN, // 1d
  },

  FIREBASE: getFirebase(),

  DB_FIREBASE_URL: process.env.DB_FIREBASE_URL,

  DATE_FORMAT: {
    MONTH: "YYYY-MM-DD",
  },

  TEST_USER: process.env.TEST_UUID,

  STRIPE: {
    STRIPE_SECRET: process.env.STRIPE_SECRET,
    STRIPE_END_POINT_SECRET: process.env.STRIPE_END_POINT_SECRET,
    SUBSCRIPTION_PRICE_ID: process.env.SUBSCRIPTION_PRICE_ID,
    SUCCESS_URL: process.env.SUCCESS_URL,
    CANCEL_URL: process.env.CANCEL_URL,
  },
};
