export interface BillFullText {
  url: string;
  fullText: string;
}

export enum BillActionTag {
  assigned = 0,
  effective_date = 1,
  first_reading = 2,
  second_reading = 3,
  arrival_in_senate = 4,
  arrival_in_house = 5,
  co_sponsor = 6,
  third_reading_vote = 7,
  committee_debate = 8,
  sponsor_removed = 9,
  fiscal_request = 10,
  dual_passed = 11,
  sent_to_governor = 12,
  governor_approved = 13,
  public_act = 14,
  bill_vote_pass = 15,
  bill_vote_fail = 16,
  amended = 17,
  other = 18,
}

export interface BillAction {
  Date: number;
  Chamber: string;
  Description: string;
  Tag: BillActionTag;
}

export interface BillVotingEvent {}

export function formatBillNumber(item: Bill) {
  let num = item.number.toString();
  while (num.length < 4) num = '0' + num;
  return item.chamber + num;
}

type action = BillAction;
interface IBillProgress {
  chamber1Arrival: action;
  chamber1Debating: action;
  chamber1Passed: action;
  chamber2Arrival: action;
  chamber2Debating: action;
  chamber2Passed: action;
  waitingForGovernor: action;
  billPassed: action;
}

export type BillProgress = Partial<IBillProgress>;

export function classifyBillProgress(item: Bill) {
  let { actions } = item;

  let search = (
    i: number,
    tag: BillActionTag
  ): [number, action | undefined] => {
    for (; i < actions.length; i++) {
      if (actions[i].Tag == tag) {
        return [i, actions[i]];
      }
    }
    return [i, undefined];
  };

  // go in order, first check introduced
  let i = 0;
  let progress: BillProgress = {};
  [i, progress.chamber1Arrival] = search(i, BillActionTag.first_reading);
  [i, progress.chamber1Debating] = search(i, BillActionTag.second_reading);
  [i, progress.chamber1Passed] = search(i, BillActionTag.bill_vote_pass);
  [i, progress.chamber2Arrival] = search(i, BillActionTag.first_reading);
  [i, progress.chamber2Debating] = search(i, BillActionTag.second_reading);
  [i, progress.chamber2Passed] = search(i, BillActionTag.bill_vote_pass);
  [i, progress.waitingForGovernor] = search(i, BillActionTag.sent_to_governor);
  [i, progress.billPassed] = search(i, BillActionTag.public_act);


  let acts = [];
  if (progress.chamber1Passed) {
    acts.push('Passed in ' + progress.chamber1Passed.Chamber);

    if (progress.chamber2Passed) {
      acts.push('Passed in ' + progress.chamber2Passed.Chamber);

      if (progress.billPassed) {
        acts.push('Bill Passed');
      } else if (progress.waitingForGovernor) {
        acts.push('Sent to Governor');
      }
    } else if (progress.chamber2Debating) {
      acts.push('Debating in ' + progress.chamber2Debating.Chamber);
    } else if (progress.chamber2Arrival) {
      acts.push('Arrival in ' + progress.chamber2Arrival.Chamber);
    }
  } else if (progress.chamber1Debating) {
    acts.push('Debating in ' + progress.chamber1Debating.Chamber);
  } else if (progress.chamber1Arrival) {
    acts.push('Arrival in ' + progress.chamber1Arrival.Chamber);
  }

  return acts;
}

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
