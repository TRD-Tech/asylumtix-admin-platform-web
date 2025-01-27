import { App } from "firebase-admin/app";
import {
  Firestore,
  FirestoreDataConverter,
  getFirestore,
} from "firebase-admin/firestore";
import { Client } from "./types/Client";
import {
  ClientDataSource,
  ClientNotFoundError,
  ClientUniqueIdentifierError,
} from "./client.datasource";

type DbClient = Omit<Client, "id">;

const clientConvertor: FirestoreDataConverter<Client, DbClient> = {
  toFirestore: (client: Client) => {
    return {
      ...client,
    };
  },

  fromFirestore: (snapshot) => {
    const data = snapshot.data() as DbClient;
    return { ...data, id: snapshot.id };
  },
};

export class FirebaseClientDatasource implements ClientDataSource {
  private firestore: Firestore;
  private clientCollection;

  constructor(private firebaseApp: App) {
    this.firestore = getFirestore(firebaseApp);
    this.clientCollection = this.firestore
      .collection("clients")
      .withConverter(clientConvertor);
  }

  async getAll(): Promise<Client[]> {
    const query = await this.clientCollection.get();

    const clients = query.docs.map((doc) => doc.data());

    return clients;
  }

  async create(client: Client): Promise<Client> {
    const docRef = this.clientCollection.doc(client.id);

    const existingDoc = await docRef.get();
    if (existingDoc.exists) throw new ClientUniqueIdentifierError();

    await docRef.set(client);
    return client;
  }

  async getById(id: string): Promise<Client | null> {
    const docRef = this.clientCollection.doc(id);

    const doc = await docRef.get();
    if (!doc.exists) return null;

    return doc.data()!;
  }

  async getByCompanyId(companyId: string): Promise<Client | null> {
    const res = await this.clientCollection
      .where("companyId", "==", companyId)
      .get();

    if (res.docs.length === 0) return null;

    const doc = res.docs[0];
    const client = doc.data();

    return client;
  }

  async update(
    id: string,
    updatedData: Partial<Omit<Client, "id">>
  ): Promise<Client> {
    const docRef = this.clientCollection.doc(id);

    const res = await docRef.get();
    if (!res.exists) throw new ClientNotFoundError();

    await docRef.update({
      ...updatedData,
    });

    const newDoc = await docRef.get();
    return newDoc.data()!;
  }

  async deleteById(id: string): Promise<void> {
    const docRef = this.clientCollection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) throw new ClientNotFoundError();

    await docRef.delete();
  }
}
