import { createSlice } from '@reduxjs/toolkit';
import { FeedState, FeedStatus } from './feed.types';
import { feedRefreshing, feedRefreshed } from './feed.reducers';
import { emptyUser } from '../models/user';

const initialState: FeedState = {
  status: FeedStatus.unknown,
  currentUser: emptyUser(),
  representatives: [],
  feed: [],
};

const billFeedSlice = createSlice({
  name: 'bill-feed',
  initialState,
  reducers: {
    feedRefreshed,
    feedRefreshing,
  },
});

export const billFeedActions = billFeedSlice.actions;
export default billFeedSlice.reducer;
