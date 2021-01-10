import { Alert } from 'react-native';
import { Representative } from '../../models';
import { BillMetadata } from '../../models/Bill';
import { Network } from '../../util';
import { User } from '../models/user';
import { StorageService } from '../storage';
import store, { AppThunk } from '../store';
import { UIService } from '../ui/ui';
import { uiActions } from '../ui/ui.slice';
import { UIStatus, UIStatusCode } from '../ui/ui.types';
import { billActions } from './bill.slice';

module BillService {
  export const launchBill = (meta: BillMetadata): AppThunk => async (
    dispatch
  ) => {
    // check if bill exists in feed
    let bill = store
      .getState()
      .feed.feed.find(
        (val) =>
          val.assembly == meta.assembly &&
          val.chamber == meta.chamber &&
          val.number == meta.number
      );

    dispatch(billActions.billRefreshing({ meta, bill }));
    dispatch(
      uiActions.setState({ status: { code: UIStatusCode.bill, bill: meta } })
    );

    // if bill was not in feed, pull from online
    if (!bill) {
      let result = await Network.getBill(meta);
      console.log('yep ' + result);
      if (result) {
        dispatch(
          billActions.billRefreshed({ meta, bill: result[0], data: result[1] })
        );
      } else {
        dispatch(uiActions.stable());
        dispatch(billActions.billClear());
        dispatch(uiActions.error({ error: "Couldn't fetch bill data" }));
      }
    } else {
      // just pull bill data
      let result = await Network.getBillData(bill);
      if (result) {
        dispatch(billActions.billRefreshed({ meta, bill, data: result }));
      } else {
        dispatch(uiActions.stable());
        dispatch(billActions.billClear());
        dispatch(uiActions.error({ error: "Couldn't fetch bill data" }));
      }
    }
  };

  export const closeBill = (): AppThunk => async (dispatch) => {
    dispatch(uiActions.stable());
    dispatch(billActions.billClear());
  };
}

export default BillService;
