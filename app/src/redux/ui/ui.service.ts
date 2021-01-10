import { Bill, BillHandler, BillMetadata } from '../../models/Bill';
import { Network } from '../../util';
import { billActions } from '../bill/bill.slice';
import store, { AppThunk } from '../store';
import { uiActions } from './ui.slice';
import { UIScreen, UIScreenCode, UIState, UIStatusCode } from './ui.types';

module UIService {
  export const setProgress = (visible: boolean) => {
    return uiActions.progressChanged({ visible });
  };

  export const setError = (error: string) => {
    return uiActions.error({ error });
  };

  export const setStableState = () => {
    return uiActions.stable();
  };

  export const setServicesLoaded = () => {
    return uiActions.servicesLoaded();
  };

  export const setState = (state: Partial<UIState>) => {
    return uiActions.setState(state);
  };

  export const setScreen = (screen: UIScreen) => {
    return uiActions.setState({ screen: screen });
  };

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
    dispatch(UIService.setScreen({ code: UIScreenCode.bill, meta: meta }));

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
}

export default UIService;
