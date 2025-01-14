export interface ProfileResponse{
    message: string;
    user: {
        imaginova_user_id: number;
        username: string;
        email: string;
    },
    stats: {
        totalLikes: number;
        totalCreations: number;
        bestCreation?: {
            creationId: number;
            positiveVotes: number;
        },
        firstCreationDate: Date;
    },
}