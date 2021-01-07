import { Representative } from '../../models';
import { Network } from '../../util';
import { AuthService } from '../auth';
import { User } from '../models/user';
import store, { AppThunk } from '../store';
import { billFeedActions } from './feed.slice';

const kDay = 1000 * 60 * 60 * 24;

module FeedService {
  export const initialize = (): AppThunk => async (dispatch) => {};

  export const refresh = (): AppThunk => async (dispatch) => {
    // set bill feed to refresh
    dispatch(billFeedActions.feedRefreshing({}));

    // refresh data
    let user: User | undefined = undefined;
    let reps: Representative[] | undefined = undefined;

    // check if user data needs to be refreshed
    let lastRefresh = store.getState().storage.lastRefresh;
    if (Date.now() - lastRefresh >= kDay) {
      let output = await Network.refresh();
      if (output) {
        [user, reps] = output;
      }
    }

    // retrieve bill data
    let bills = await Network.loadBillFeed();

    dispatch(billFeedActions.feedRefreshed({ bills, user, reps }));
  };
}

export default FeedService;
