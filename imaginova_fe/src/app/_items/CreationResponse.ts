import { CreationItem } from "./CreationType";

export interface CreationResponse {
    alreadyParticipated: boolean;
    message: string;
}

export interface CreationPageResponse {
    creation: CreationItem;
    message: string;
    hasNextPage: boolean;
}
