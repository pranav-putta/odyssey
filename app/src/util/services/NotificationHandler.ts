import messaging, {
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import { BillMetadata } from '../../models/Bill';
import { BillService } from '../../redux/bill';
import { Notification, NotificationType } from '../../redux/models';
import { StorageService } from '../../redux/storage';
import store from '../../redux/store';
import { UIService } from '../../redux/ui/ui';

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
    if (message && message.notification) {
      if (message.data && message.data.messageType == 'card') {
        store.dispatch(
          StorageService.update({
            notifications: [JSON.parse(message.data.content)],
          })
        );
      } else if (message.data && message.data.messageType == 'bill') {
        //PersistentStorage.storeNotification(message.data.content);
      }
    }
  }

  function handleMessageOpen(message: FirebaseMessagingTypes.RemoteMessage) {
    try {
      if (message.data && message.data.content) {
        let notification: Notification = JSON.parse(message.data.content);

        if (notification.type == NotificationType.bill) {
          let meta: BillMetadata = JSON.parse(notification.content);
          store.dispatch(UIService.launchBill(meta));
        }
      }
    } catch (err) {}
  }

  export async function subscribeToAlerts() {
    await messaging().subscribeToTopic('general_alerts');
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
          handleMessageOpen(message);
        }
      });
  }

  export function latestNotification() {
    let notifications = StorageService.notifications();
    notifications.sort((a, b) => {
      if (a.seen && !b.seen) {
        return -1;
      } else if (!a.seen && b.seen) {
        return 1;
      }

      if (a.time == 'asap' && b.time == 'asap') {
        return 0;
      } else if (a.time == 'asap') {
        return -1;
      } else if (b.time == 'asap') {
        return 1;
      } else {
        return a.time - b.time;
      }
    });

    return notifications[0];
  }
}
