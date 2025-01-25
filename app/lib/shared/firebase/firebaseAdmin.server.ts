import path from "path";
import admin from "firebase-admin";

export const firebaseAdmin = admin.apps.length
  ? admin.app()
  : admin.initializeApp({
      credential: admin.credential.cert(
        path.join(
          process.cwd(),
          "secrets",
          "asylumtix-admin-platform-service-account-key.json"
        )
      ),
    });
