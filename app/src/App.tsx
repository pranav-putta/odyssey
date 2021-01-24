import React from 'react';
import { NavigationContainerRef, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import store, { persistor } from './redux/store';
import { StorageService } from './redux/storage';
import Navigator from './screens/Navigator';
import { Services } from './util/services/Services';
import { NotificationLocation, NotificationType } from './redux/models';
import { Dimensions } from 'react-native';
import { AuthStatus } from './redux/auth/auth.types';
import { UIService } from './redux/ui/ui';
import { UIScreenCode } from './redux/ui/ui.types';

type Props = {
  navigation: any;
};
type State = {};

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

class App extends React.Component<Props, State> {
  private storeUnsubscribe;

  constructor(props: Props) {
    super(props);

    // bind
    this.uiHandler = this.uiHandler.bind(this);

    this.storeUnsubscribe = store.subscribe(this.uiHandler);
  }

  componentDidMount() {
    this.initialize();

    this.uiHandler();
  }

  componentWillUnmount() {
    this.storeUnsubscribe();
  }

  uiHandler() {
    let state = store.getState();

    if (!state.ui.servicesLoaded) {
      return;
    }
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
