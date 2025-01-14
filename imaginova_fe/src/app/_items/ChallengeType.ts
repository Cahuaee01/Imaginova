export interface ChallengeItem {
    challenge_id?: number; 
    description: string;
    theme_event: string;
    definitive: boolean;
    challenge_date: Date;
    media_type: number;
    createdAt?: Date; 
    updatedAt?: Date;
    creationsCount: number;
  }