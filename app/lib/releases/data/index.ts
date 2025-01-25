// We will be exporting the default data source here
import { firebaseAdmin } from "~/lib/shared/firebase/firebaseAdmin.server";
import { FirebaseReleaseDatasource } from "./firebase-release.datasource.server";

export const releaseDatasource = new FirebaseReleaseDatasource(firebaseAdmin);
