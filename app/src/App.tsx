import React from 'react';
import { NavigationContainerRef, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import BootSplash from 'react-native-bootsplash';
import { Config } from './util/Config';
import inAppMessaging from '@react-native-firebase/in-app-messaging';
import { Network, NotificationHandler } from './util';
import { Analytics } from './util/services/AnalyticsHandler';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import store, { persistor } from './redux/store';
import { StorageService } from './redux/storage';
import Navigator from './screens/Navigator';
import { Services } from './util/services/Services';
import { NotificationLocation, NotificationType } from './redux/models';
import { Dimensions } from 'react-native';

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
    Services.initialize();

  }

  render() {
    return (
      <Provider store={store}>
        <PersistGate persistor={persistor}>
          <Navigator />
        </PersistGate>
      </Provider>
    );
  }
}

export default App;
