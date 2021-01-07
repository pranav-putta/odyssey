import { Network, NotificationHandler } from '..';
import { AuthService } from '../../redux/auth';
import store from '../../redux/store';
import { UIService } from '../../redux/ui/ui';
import { Config } from '../Config';
import { Analytics } from './AnalyticsHandler';
import inAppMessaging from '@react-native-firebase/in-app-messaging';
import { BackgroundService } from './BackgroundService';
import { StorageService } from '../../redux/storage';

export module Services {
  export async function initialize() {
    store.dispatch(AuthService.initialize());
    Network.setupPerfMonitor();
    await Config.initRemoteConfig();
    await inAppMessaging().setMessagesDisplaySuppressed(false);
    StorageService.incAppLaunch();
    await Analytics.launch();
    await NotificationHandler.createNotificationOpenListener();
    BackgroundService.initialize();
    // essential services loaded
    store.dispatch(UIService.setServicesLoaded());
  }
}
