import { Representative } from '../../models';
import { Network } from '../../util';
import { PersistentStorage } from '../../util/PersistentStorage';
import { AuthService } from '../auth/auth';
import store, { AppThunk } from '../store';
import { billFeedActions } from './feed.slice';

const kDay = 1000 * 60 * 60 * 24;

module FeedService {
  export const initialize = (): AppThunk => async (dispatch) => {};

  export const refresh = (): AppThunk => async (dispatch) => {
    // set bill feed to refresh
    dispatch(billFeedActions.feedRefreshing({}));

    // refresh data
    let user = AuthService.getUser();
    let reps: Representative[] = [];

    // check if user data needs to be refreshed
    let lastRefresh = await PersistentStorage.getLastRefreshTime();
    if (Date.now() - lastRefresh >= kDay) {
      let output = await Network.refresh();
      if (output) {
        user = output[0];
        reps = output[1];
      }
    }

    // retrieve bill data
    let bills = await Network.loadBillFeed();

    dispatch(billFeedActions.feedRefreshed({ bills, user, reps }));
  };
}

export default FeedService;
