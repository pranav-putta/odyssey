import { Bill, BillHandler, BillMetadata } from '../../models/Bill';
import { BillData, BillVotes, Comment, Vote } from '../../models/BillData';
import { Network } from '../../util';
import store, { AppThunk } from '../store';
import { uiActions } from './ui.slice';
import {
  UIEvent,
  UIScreen,
  UIScreenCode,
  UIState,
  UIStatusCode,
} from './ui.types';

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

  export const closeBill = (): AppThunk => async (dispatch) => {
    dispatch(
      UIService.setScreen({
        code: UIScreenCode.home,
      })
    );
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

    dispatch(
      uiActions.setState({
        screen: { code: UIScreenCode.bill, meta, bill },
        status: { code: UIStatusCode.loading },
      })
    );

    // if bill was not in feed, pull from online
    if (!bill) {
      let result = await Network.getBill(meta);
      if (result) {
        dispatch(
          UIService.setState({
            status: { code: UIStatusCode.stable },
            screen: {
              code: UIScreenCode.bill,
              meta,
              bill: result[0],
              billData: result[1],
            },
          })
        );
      } else {
        dispatch(
          UIService.setState({
            screen: {
              code: UIScreenCode.home,
            },
            status: {
              code: UIStatusCode.error,
              message: "Couldn't fetch bill data",
            },
          })
        );
      }
    } else {
      // just pull bill data
      let result = await Network.getBillData(bill);

      if (result) {
        dispatch(
          UIService.setState({
            status: { code: UIStatusCode.stable },
            screen: {
              code: UIScreenCode.bill,
              meta,
              bill,
              billData: result,
            },
          })
        );
      } else {
        dispatch(
          UIService.setState({
            screen: {
              code: UIScreenCode.home,
            },
            status: {
              code: UIStatusCode.error,
              message: "Couldn't fetch bill data",
            },
          })
        );
      }
    }
  };

  export function currentBill(): Bill | undefined {
    let { ui } = store.getState();
    return ui.screen.code == UIScreenCode.bill ? ui.screen.bill : undefined;
  }

  export function billVote(vote: Vote) {
    let { ui, storage } = store.getState();

    let bill = ui.screen.code == UIScreenCode.bill ? ui.screen.bill : undefined;
    let data =
      ui.screen.code == UIScreenCode.bill ? ui.screen.billData : undefined;
    let uid = storage.user.uid;

    if (bill && data && ui.screen.code == UIScreenCode.bill) {
      Network.setBillVote(bill, vote);
      let updatedVotes = { ...data.votes };

      updatedVotes[uid] = vote == updatedVotes[uid] ? Vote.None : vote;
      store.dispatch(
        UIService.setState({
          screen: { ...ui.screen, billData: { ...data, votes: updatedVotes } },
        })
      );
    }
  }

  export function billComment(comment: Comment, shouldSendReps: boolean) {
    let { ui, storage } = store.getState();

    let bill = ui.screen.code == UIScreenCode.bill ? ui.screen.bill : undefined;
    let data =
      ui.screen.code == UIScreenCode.bill ? ui.screen.billData : undefined;

    store.dispatch(
      UIService.setState({ status: { code: UIStatusCode.loading } })
    );

    if (bill && data && ui.screen.code == UIScreenCode.bill) {
      Network.addComment(bill, comment, shouldSendReps)
        .then(() => {
          // successful upload, push changes
          if (ui.screen.code != UIScreenCode.bill || !data) {
            return;
          }

          let updatedComments = { ...data.comments };
          updatedComments[comment.cid] = comment;

          store.dispatch(
            UIService.setState({
              status: { code: UIStatusCode.stable },
              lastEvent: UIEvent.created_comment,
              screen: {
                ...ui.screen,
                billData: { ...data, comments: updatedComments },
              },
            })
          );
        })
        .catch(() => {
          store.dispatch(UIService.setError("Couldn't add a comment!"));
        });
    }
  }
}

export default UIService;
