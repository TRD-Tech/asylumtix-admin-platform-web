import { ReleaseStatus } from "./ReleaseStatus";

export type Release = {
    id: string;
    name: string;
    version: string;
    url: string;
    status: ReleaseStatus;
}