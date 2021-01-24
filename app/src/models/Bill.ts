import { Images } from '../assets/images';
import { BillData, Comment, Vote } from './BillData';

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

export interface BillVotingEvent {
  Chamber: string;
  Votes: { [key: string]: string };
}

export function formatBillNumber(item: Bill) {
  let num = item.number.toString();
  while (num.length < 4) num = '0' + num;
  return item.chamber + num;
}

type action = BillAction;

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

export interface BillMetadata {
  assembly: number;
  chamber: string;
  number: number;
}

interface IBillProgress {
  introduced: action;
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

export type BillProgressAction = {
  text: string;
  action: BillAction;
  image: any;
};

export module BillHandler {
  export function id(b: Bill | BillMetadata) {
    return b.assembly + b.chamber + b.number;
  }

  export function meta(b: Bill): BillMetadata {
    return {
      assembly: b.assembly,
      number: b.number,
      chamber: b.chamber,
    };
  }

  export function constructTimeline(b: Bill) {
    let { actions } = b;

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
    [i, progress.waitingForGovernor] = search(
      i,
      BillActionTag.sent_to_governor
    );
    [i, progress.billPassed] = search(i, BillActionTag.public_act);

    let acts: BillProgressAction[] = [];
    if (actions.length > 0) {
      acts.push({
        action: actions[0],
        image: Images.bill_introduced,
        text: 'Bill Introduced',
      });
    }
    if (progress.chamber1Passed) {
      acts.push({
        action: progress.chamber1Passed,
        image: Images.bill_body_passed,
        text: 'Passed in ' + progress.chamber1Passed.Chamber,
      });

      if (progress.chamber2Passed) {
        acts.push({
          action: progress.chamber2Passed,
          image: Images.bill_body_passed,
          text: 'Passed in ' + progress.chamber2Passed.Chamber,
        });

        if (progress.billPassed) {
          acts.push({
            action: progress.billPassed,
            image: Images.bill_passed,
            text: 'Bill signed into law',
          });
        } else if (progress.waitingForGovernor) {
          acts.push({
            action: progress.waitingForGovernor,
            image: Images.bill_passed,
            text: 'Sent to Governor',
          });
        }
      } else if (progress.chamber2Debating) {
        acts.push({
          action: progress.chamber2Debating,
          image: Images.bill_debating,
          text: 'Debating in ' + progress.chamber2Debating.Chamber,
        });
      } else if (progress.chamber2Arrival) {
        acts.push({
          action: progress.chamber2Arrival,
          image: Images.bill_debating,
          text: 'Arrival in ' + progress.chamber2Arrival.Chamber,
        });
      }
    } else if (progress.chamber1Debating) {
      acts.push({
        action: progress.chamber1Debating,
        image: Images.bill_debating,
        text: 'Debating in ' + progress.chamber1Debating.Chamber,
      });
    } else if (progress.chamber1Arrival) {
      acts.push({
        action: progress.chamber1Arrival,

        image: Images.bill_debating,
        text: 'Arrival in ' + progress.chamber1Arrival.Chamber,
      });
    }

    return acts;
  }

  export function extractTopComment(
    data: BillData
  ): { yes?: Comment; no?: Comment } {
    let { comments, votes } = data;

    let ids = Object.keys(comments);

    let topYes = undefined;
    try {
      topYes = ids
        .filter((id) => votes[comments[id].uid] == Vote.Yes)
        .reduce((prev, curr) =>
          comments[prev].likes > comments[curr].likes ? prev : curr
        );
    } catch (err) {}

    let topNo = undefined;
    try {
      topNo = ids
        .filter((id) => votes[comments[id].uid] == Vote.No)
        .reduce((prev, curr) =>
          comments[prev].likes > comments[curr].likes ? prev : curr
        );
    } catch (err) {}

    return {
      yes: topYes ? comments[topYes] : undefined,
      no: topNo ? comments[topNo] : undefined,
    };
  }
}
