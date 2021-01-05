export enum Vote {
  None = -1,
  Yes = 0,
  No = 1,
}

export interface BillVotes {
  [uid: string]: Vote;
}

export interface Comment {
  uid: string;
  text: string;
  likes: { [uid: string]: boolean };
  name: string;
  date: number;
}

export interface BillData {
  bill_id: string;
  votes: BillVotes;
  comments: Comment[];
}
