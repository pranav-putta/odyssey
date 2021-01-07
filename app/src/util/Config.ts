import { firebase } from '@react-native-firebase/auth';
import remoteConfig from '@react-native-firebase/remote-config';
import { Alert } from 'react-native';
import { Category } from '../models/Category';
import { Topic } from '../models/Topic';
import { StorageService } from '../redux/storage';
import store from '../redux/store';
import config_file from './config.json';

export module Config {
  export const configFile = 'config.json';
  const KEY_TOPICS_CONFIG = 'topicsConfig';
  const KEY_SMALL_TOPICS_CONFIG = 'smallTopicsConfig';

  export async function initRemoteConfig() {
    await remoteConfig().setDefaults({
      topicsConfig: JSON.stringify(config_file.topicsConfig),
      smallTopicsConfig: JSON.stringify(config_file.smallTopicsConfig),
    });
    let refresh = store.getState().storage.configRefresh;
    await remoteConfig().fetch(refresh);
    await remoteConfig().activate();
    if (refresh == 0) {
      store.dispatch(StorageService.update({ configRefresh: 21600 }));
    }
  }

  export async function alertUpdateConfig() {
    Alert.alert(
      'Detected an app update! Close and reopen the app to see changes.'
    );
    store.dispatch(StorageService.update({ configRefresh: 21600 }));
  }

  export function getTopics(): { [key: string]: Category } {
    return JSON.parse(remoteConfig().getString(KEY_TOPICS_CONFIG));
  }

  export function getSmallTopics(): { [key: string]: Topic } {
    return JSON.parse(remoteConfig().getString(KEY_SMALL_TOPICS_CONFIG));
  }

  export function getTopicsAsArray(): Category[] {
    return Object.values(getTopics());
  }

  export function getSmallTopicsAsArray(): Topic[] {
    return Object.values(getSmallTopics());
  }
}
