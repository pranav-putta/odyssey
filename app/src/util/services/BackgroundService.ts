import BackgroundFetch from 'react-native-background-fetch';
import { StorageService } from '../../redux/storage';
import store from '../../redux/store';
import { Network } from './NetworkHandler';

export module BackgroundService {
  export function initialize() {
    BackgroundFetch.configure(
      {
        minimumFetchInterval: 120,
        requiredNetworkType: BackgroundFetch.NETWORK_TYPE_ANY,
      },
      backgroundRefresh
    );
  }

  async function backgroundRefresh() {
    let result = await Network.refresh();
    if (result) {
      let [user, reps] = result;
      store.dispatch(StorageService.update({ user, representatives: reps }));
    }
  }
}
