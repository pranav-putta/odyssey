import React from 'react';
import { NavigationContainerRef, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import BootSplash from 'react-native-bootsplash';
import { Config } from './util/Config';
import inAppMessaging from '@react-native-firebase/in-app-messaging';
import { incrementAppLaunch, Network, NotificationHandler } from './util';
import { Analytics } from './util/AnalyticsHandler';
import { Provider } from 'react-redux';
import store from './redux/store';
import Navigator from './screens/Navigator';

type Props = {
  navigation: any;
};
type State = {
  screen: Route;
  loaded: boolean;
  routeName?: string;
};

type AppStackParams = {
  Login: undefined;
  Home: undefined;
  Setup: undefined;
};
export type HomeNavigation = StackNavigationProp<AppStackParams, 'Home'>;
export type LoginNavigation = StackNavigationProp<AppStackParams, 'Login'>;
export type SetupNavigation = StackNavigationProp<AppStackParams, 'Setup'>;
export type SetupParams = RouteProp<AppStackParams, 'Setup'>;
export type HomeParams = RouteProp<AppStackParams, 'Home'>;

type Route = 'Home' | 'Setup' | 'Login';

class App extends React.Component<Props, State> {
  private NavigationRef = React.createRef<NavigationContainerRef>();

  constructor(props: Props) {
    super(props);
    this.state = {
      screen: 'Home',
      loaded: false,
    };
  }

  componentDidMount() {
    this.initialize();
  }

  async initialize() {
    // setup all firebase stuffs
    BootSplash.show();
    Network.setupPerfMonitor();
    await Config.initRemoteConfig();
    await inAppMessaging().setMessagesDisplaySuppressed(false);
    await incrementAppLaunch();
    await Analytics.launch();
    await NotificationHandler.createNotificationOpenListener();
  }

  render() {
    return (
      <Provider store={store}>
        <Navigator />
      </Provider>
    );
  }
}

export default App;
