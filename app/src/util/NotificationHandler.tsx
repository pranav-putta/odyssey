import messaging, {
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import inappmessaging from '@react-native-firebase/in-app-messaging';
import { Alert } from 'react-native';
import { storeNotification } from '../models';
import { Notification } from '../models/Notification';

export module NotificationHandler {
  export async function requestUserPermission() {
    const authStatus = await messaging().requestPermission();
    if (authStatus === messaging.AuthorizationStatus.AUTHORIZED) {
      return true;
    } else if (authStatus === messaging.AuthorizationStatus.PROVISIONAL) {
      return true;
    } else {
      return false;
    }
  }

  function handleMessage(
    message: FirebaseMessagingTypes.RemoteMessage,
    delay?: boolean
  ) {
    console.log(message);
    if (message && message.notification) {
      if (message.data && message.data.messageType == 'card') {
        storeNotification(message.data.content);
      }
    }
  }

  export async function subscribeToAlerts() {
    messaging().subscribeToTopic('alerts');
  }

  export async function createForegroundListener() {
    messaging().onMessage((message) => {
      handleMessage(message, true);
    });
  }

  export async function createNotificationOpenListener() {
    messaging().onNotificationOpenedApp(handleMessage);
    messaging()
      .getInitialNotification()
      .then((message) => {
        if (message) {
          handleMessage(message);
        }
      });
  }
}
