import { Representative } from '../../models';
import { Bill } from '../../models/Bill';
import { BillData } from '../../models/BillData';
import { User } from '../models/user';

export enum FeedStatus {
  unknown,
  refreshing,
  refreshed,
}

export interface FeedState {
  status: FeedStatus;
  feed: Bill[];
  representatives: Representative[];
}
export interface FeedRefreshingPayload {}
export interface FeedRefreshingFinishedPayload {
  bills: Bill[];
  reps?: Representative[];
}

export interface FeedSelectBillPayload {
  bill: Bill;
  data: BillData;
}
