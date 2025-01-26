import admin from "firebase-admin";

let serviceAccountKeyJson: string;

if (process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_KEY_JSON) {
  serviceAccountKeyJson = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_KEY_JSON;
} else if (process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_KEY_BASE64) {
  serviceAccountKeyJson = Buffer.from(
    process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_KEY_BASE64,
    "base64"
  ).toString("ascii");
} else {
  throw new Error(
    "Missing FIREBASE_ADMIN_SERVICE_ACCOUNT_KEY_JSON or FIREBASE_ADMIN_SERVICE_ACCOUNT_KEY_BASE64 environment variable"
  );
}

export const firebaseAdmin = admin.apps.length
  ? admin.app()
  : admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(serviceAccountKeyJson)),
    });
