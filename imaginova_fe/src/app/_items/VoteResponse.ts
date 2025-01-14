export interface VoteResponse {
  message: string;
  positiveVotes: number;
  negativeVotes: number;
  who_voted: {
    imaginova_user: number;
    feedback_value: boolean;
  }[]; 
  voteStatus: string;
}
