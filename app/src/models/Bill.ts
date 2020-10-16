export interface BillFullText {
  url: string;
  fullText: string;
}

export interface BillAction {
  date: number;
  chamber: string;
  description: string;
  tag: number;
}

export interface BillVotingEvent {}

export interface Bill {
  assembly: number;
  chamber: string;
  number: number;
  title: string;
  short_summary: string;
  full_summary: string;
  sponsor_ids: number[];
  house_primary_sponsor: number;
  senate_primary_sponsor: number;
  actions_hash: string;
  chief_sponsor: number;
  url: string;
  last_updated: number;
  category: string;
  bill_text: BillFullText;
  actions: BillAction[];
  voting_events: BillVotingEvent[];
}
