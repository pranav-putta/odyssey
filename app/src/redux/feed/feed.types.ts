import { Representative } from '../../models';
import { Bill } from '../../models/Bill';
import { User } from '../models/user';

export enum FeedStatus {
  unknown,
  refreshing,
  refreshed,
}

export interface FeedState {
  status: FeedStatus;
  feed: Bill[];
  currentUser: User;
  representatives: Representative[];
}
export interface FeedRefreshingPayload {}
export interface FeedRefreshingFinishedPayload {
  bills: Bill[];
  user?: User;
  reps?: Representative[];
}
