import { Representative } from '../../models';
import { Network } from '../../util';
import { formatCommitteeArray } from '../models/committee';
import { User } from '../models/user';
import { StorageService } from '../storage';
import store, { AppThunk } from '../store';
import { UIService } from '../ui/ui';
import { uiActions } from '../ui/ui.slice';
import { billFeedActions } from './feed.slice';

const kDay = 1000 * 60 * 60 * 24;

module FeedService {
  export const initialize = (): AppThunk => async (dispatch) => {};

  /**
   * refresh user data, user information and rep data, should happen roughly every day
   */
  export const refreshUserData = async () => {
    // refresh data
    let user: User | undefined = undefined;
    let reps: Representative[] | undefined = undefined;

    // check if user data needs to be refreshed
    let lastRefresh = store.getState().storage.lastRefresh;
    if (Date.now() - lastRefresh >= kDay) {
      let output = await Network.refresh();

      if (output) {
        [user, reps] = output;
        // set storage
        store.dispatch(
          StorageService.update({
            user,
            representatives: reps,
            lastRefresh: Date.now(),
          })
        );
      }
    }
  };

  export const refresh = (): AppThunk => async (dispatch) => {
    // set bill feed to refresh
    dispatch(billFeedActions.feedRefreshing({}));
    await FeedService.refreshUserData();

    // mark that data refresh is over
    if (!store.getState().ui.firstDataRefresh) {
      dispatch(UIService.setState({ firstDataRefresh: true }));
    }

    // retrieve bill data
    let bills = await Network.loadBillFeed();

    let reps = store.getState().storage.representatives;

    // do in background
    Network.loadCommittees().then((committees) => {
      dispatch(
        StorageService.update({ committees: formatCommitteeArray(committees) })
      );
    });
    dispatch(billFeedActions.feedRefreshed({ bills, reps }));
  };
}

export default FeedService;
