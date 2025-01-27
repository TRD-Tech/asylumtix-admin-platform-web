import { Client } from "./types/Client";

export class ClientNotFoundError extends Error {}
export class ClientUniqueIdentifierError extends Error {}

export interface ClientDataSource {
  getAll(): Promise<Client[]>;

  getById(id: string): Promise<Client | null>;

  getByCompanyId(companyId: string): Promise<Client | null>;

  update(id: string, updatedData: Partial<Omit<Client, "id">>): Promise<Client>;

  deleteById(id: string): Promise<void>;
}
