import { App } from "firebase-admin/app";
import {
  Firestore,
  FirestoreDataConverter,
  getFirestore,
} from "firebase-admin/firestore";

import {
  ReleaseDataSource,
  ReleaseNotFoundError,
  ReleaseUniqueIdentifierError,
} from "./release.datasource";
import { Release } from "./types/Release";
import { ReleaseStatus } from "./types/ReleaseStatus";

type DbRelease = {
  name: string;
  url: string;
  status?: ReleaseStatus;
  version?: string;
};

const releaseConvertor: FirestoreDataConverter<Release, DbRelease> = {
  toFirestore: (release: Release) => {
    return {
      name: release.name,
      url: release.url,
      status: release.status,
      version: release.version,
    };
  },

  fromFirestore: (snapshot) => {
    const data = snapshot.data() as DbRelease;
    return {
      id: snapshot.id,

      name: data.name,
      url: data.url,

      status: data.status ?? ReleaseStatus.healthy,
      version: data.version ?? "N/A",
    };
  },
};

export class FirebaseReleaseDatasource implements ReleaseDataSource {
  private firestore: Firestore;
  private releaseCollection;

  constructor(private firebaseApp: App) {
    this.firestore = getFirestore(firebaseApp);
    this.releaseCollection = this.firestore
      .collection("releases")
      .withConverter(releaseConvertor);
  }

  async getAll(): Promise<Release[]> {
    const query = await this.releaseCollection.get();

    const releases = query.docs.map((doc) => doc.data());

    return releases;
  }

  async getById(id: string): Promise<Release | null> {
    const docRef = this.releaseCollection.doc(id);

    const doc = await docRef.get();
    if (!doc.exists) return null;

    return doc.data()!;
  }

  async create(release: Release): Promise<Release> {
    const docRef = this.releaseCollection.doc(release.id);

    const existingDoc = await docRef.get();
    if (existingDoc.exists) throw new ReleaseUniqueIdentifierError();

    await docRef.set(release);
    return release;
  }

  async update(
    id: string,
    updatedData: Partial<Omit<Release, "id">>
  ): Promise<Release> {
    const docRef = this.releaseCollection.doc(id);

    const res = await docRef.get();
    if (!res.exists) throw new ReleaseNotFoundError();

    await docRef.update({
      ...updatedData,
    });

    const newDoc = await docRef.get();
    return newDoc.data()!;
  }

  async deleteById(id: string): Promise<void> {
    const docRef = this.releaseCollection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) throw new ReleaseNotFoundError();

    await docRef.delete();
  }
}
