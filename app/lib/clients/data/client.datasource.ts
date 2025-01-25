import { Client } from "./types/Client";

export class ClientNotFoundError extends Error {}
export class ClientUniqueIdentifierError extends Error {}

export interface ClientDataSource {
  getAll(): Promise<Client[]>;

  getByCompanyId(companyId: string): Promise<Client | null>;

  update(id: string, updatedData: Partial<Omit<Client, "id">>): Promise<Client>;
}
