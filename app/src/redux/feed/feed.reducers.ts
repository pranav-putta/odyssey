import { CaseReducer, PayloadAction } from '@reduxjs/toolkit';
import {
  FeedRefreshingFinishedPayload,
  FeedRefreshingPayload,
  FeedState,
  FeedStatus,
} from './feed.types';

type AuthReducer<T> = CaseReducer<FeedState, PayloadAction<T>>;

/**
 * sets bill feed to refreshed and sets feed
 * @param state
 * @param action
 */
export const feedRefreshed: AuthReducer<FeedRefreshingFinishedPayload> = (
  state,
  action
) => {
  const { bills, reps, user } = action.payload;
  state.status = FeedStatus.refreshed;
  state.feed = bills;

  if (user) {
    state.currentUser = user;
  }

  if (reps) {
    state.representatives = reps;
  }
};

/**
 * sets bill status to refreshing
 * @param state
 * @param action
 */
export const feedRefreshing: AuthReducer<FeedRefreshingPayload> = (
  state,
  action
) => {
  state.status = FeedStatus.refreshing;
};
