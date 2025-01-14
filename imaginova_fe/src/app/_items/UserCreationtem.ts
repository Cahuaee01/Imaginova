export interface UserCreationItem {
    creation_id?: number; 
    title: string;
    description: string;
    media_path: string;
    imaginova_user: number;
    challenge: number;
    media_type: number;
    creation_date: Date;
    owner: {
      imaginova_user_id: number;
      username: string;
      email:string;
    };
    relative_challenge: {
        challenge_id: number;
        theme_event: string;
        description: string;
        challenge_date: Date;
    }
    storage_type: number;
    positiveVotes: number;
    negativeVotes: number;
    voteStatus: string;
  }