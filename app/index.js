/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';
import messaging from '@react-native-firebase/messaging';

messaging().setBackgroundMessageHandler(async (remoteMessage) => {});

AppRegistry.registerComponent(appName, async () => {
  let headless = await messaging().getIsHeadless();
  if (!headless) {
    return App;
  } else {
    return null;
  }
});
