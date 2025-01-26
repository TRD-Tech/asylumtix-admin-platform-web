import admin from "firebase-admin";

export const firebaseAdmin = admin.apps.length
  ? admin.app()
  : admin.initializeApp({
      credential: admin.credential.cert(
        JSON.parse(process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_KEY as string)
      ),
    });
