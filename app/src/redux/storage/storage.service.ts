import { Bill, BillHandler } from '../../models/Bill';
import store, { AppThunk } from '../store';
import { initialState, storageActions } from './storage.slice';
import { StorageState } from './storage.types';

module StorageService {
  export function update(data: Partial<StorageState>) {
    return storageActions.updateStorage(data);
  }

  export function user() {
    return store.getState().storage.user;
  }

  export function reps() {
    return store.getState().storage.representatives;
  }

  export function notifications() {
    return store.getState().storage.notifications;
  }

  export const incAppLaunch = (): AppThunk => async (dispatch) => {
    let ct = store.getState().storage.appLaunchCount;
    dispatch(storageActions.updateStorage({ appLaunchCount: ct }));
  };

  export const billLike = (bill: Bill, liked: boolean) => {
    return storageActions.updateBillLiked({ bill, liked });
  };

  export const logout = (): AppThunk => async (dispatch) => {
    dispatch(storageActions.updateStorage(initialState));
  };

  export const tutorialSeen = (): AppThunk => async (dispatch) => {
    dispatch(storageActions.updateStorage({ tutorialSeen: true }));
  };
}

export default StorageService;
