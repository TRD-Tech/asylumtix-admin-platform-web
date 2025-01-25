import { firebaseAdmin } from "~/lib/shared/firebase/firebaseAdmin.server";
import { FirebaseClientDatasource } from "./firebase-client.datasource.server";

export const clientDatasource = new FirebaseClientDatasource(firebaseAdmin);
