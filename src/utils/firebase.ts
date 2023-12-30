import { FIREBASE, DB_FIREBASE_URL } from "config";
import admin from "firebase-admin";

admin.initializeApp({
  credential: admin.credential.cert(FIREBASE),
  databaseURL: DB_FIREBASE_URL
});

export default admin;
