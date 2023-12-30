import dotenv from "dotenv";
import path from "path";
import pkg from "../package.json";

dotenv.config({ path: path.join(__dirname, "/.env") });

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
    ENV: "production",
  },

  JWT: {
    ALGO: process.env.JWT_ALGORITHM,
    SECRET: process.env.JWT_SECRET, // uuid
    EXPIRATION: process.env.JWT_EXPIRES_IN, // 1hr
  },

  FIREBASE: getFirebase(),

  DATE_FORMAT: {
    MONTH: "YYYY-MM-DD",
  },
};
