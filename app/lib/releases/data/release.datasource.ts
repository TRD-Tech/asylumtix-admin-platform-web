import { Release } from "./types/Release";

export class ReleaseNotFoundError extends Error {}
export class ReleaseUniqueIdentifierError extends Error {}

export interface ReleaseDataSource {
  getAll(): Promise<Release[]>;

  getById(id: string): Promise<Release | null>;

  create(release: Release): Promise<Release>;

  update(
    id: string,
    updatedData: Partial<Omit<Release, "id">>
  ): Promise<Release>;

  deleteById(id: string): Promise<void>;
}
