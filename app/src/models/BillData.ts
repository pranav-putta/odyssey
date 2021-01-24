export enum Vote {
  None = -1,
  Yes = 0,
  No = 1,
}

export interface BillVotes {
  [uid: string]: Vote;
}

export interface Comments {
  [uid: string]: Comment;
}

export interface Comment {
  uid: string;
  text: string;
  likes: { [uid: string]: boolean };
  name: string;
  date: number;
  cid: string;
}

export interface BillData {
  bill_id: string;
  votes: BillVotes;
  comments: Comments;
}
