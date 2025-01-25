import path from "path";
import admin from "firebase-admin";

import { writeFileSync, existsSync } from "fs";

const secretsFilePath = path.join(
  process.cwd(),
  "secrets",
  "asylumtix-admin-platform-service-account-key.json"
);

if (!existsSync) {
  writeFileSync(
    secretsFilePath,
    process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_KEY as string
  );
}

export const firebaseAdmin = admin.apps.length
  ? admin.app()
  : admin.initializeApp({
      credential: admin.credential.cert(secretsFilePath),
    });
