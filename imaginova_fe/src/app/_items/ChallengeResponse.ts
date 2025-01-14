import { ChallengeItem } from "./ChallengeType";

export interface ChallengeResponse {
    challenge: ChallengeItem;
    message: string;
}

export interface ChallengesResponse {
    challenges: ChallengeItem;
    message: string;
    hasNextPage: boolean;
    totalPages: number;
}
