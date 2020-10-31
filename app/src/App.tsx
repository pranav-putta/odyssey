import React from 'react';
import {
  NavigationContainer,
  NavigationContainerRef,
  RouteProp,
} from '@react-navigation/native';
import {
  createStackNavigator,
  StackNavigationProp,
} from '@react-navigation/stack';
import LoginScreen from './screens/login/LoginScreen';
import HomeScreen from './screens/home/HomeScreen';
import auth from '@react-native-firebase/auth';
import BootSplash from 'react-native-bootsplash';
import AsyncStorage from '@react-native-community/async-storage';
import { storage } from './assets';
import { Config } from './util/Config';
import inAppMessaging from '@react-native-firebase/in-app-messaging';
import {
  fetchUser,
  incrementAppLaunch,
  Network,
  NotificationHandler,
} from './util';
import { Analytics } from './util/AnalyticsHandler';

type Props = {
  navigation: any;
};
type State = {
  loggedIn: boolean;
  loaded: boolean;
  routeName?: string;
};

type AppStackParams = {
  Login: undefined;
  Home: undefined;
};
export type HomeNavigation = StackNavigationProp<AppStackParams, 'Home'>;
export type LoginNavigation = StackNavigationProp<AppStackParams, 'Login'>;
export type HomeParams = RouteProp<AppStackParams, 'Home'>;

const Stack = createStackNavigator<AppStackParams>();

class App extends React.Component<Props, State> {
  private NavigationRef;

  constructor(props: Props) {
    super(props);
    this.state = {
      loggedIn: false,
      loaded: false,
    };

    auth().onAuthStateChanged((user) => {
      if (!user) {
        this.chooseRoute();
      }
    });

    this.NavigationRef = React.createRef<NavigationContainerRef>();
  }

  componentDidMount() {
    this.initialize();
  }

  async initialize() {
    await Config.initRemoteConfig();
    await inAppMessaging().setMessagesDisplaySuppressed(false);
    await incrementAppLaunch();
    Analytics.launch();
    Network.setupPerfMonitor();
    NotificationHandler.createNotificationOpenListener();
    this.chooseRoute();
  }

  async chooseRoute() {
    if (this.state.loaded) {
      BootSplash.show();
    }
    this.setState({ loaded: false }, async () => {
      let signedIn =
        (await AsyncStorage.getItem(storage.userSignedIn)) == 'true';
      BootSplash.hide({ duration: 100 });
      if (signedIn) {
        let user = await fetchUser();
        if (user) {
          await Analytics.login(user.uid, false);
        }
        this.setState({ loaded: true, loggedIn: true });
      } else {
        this.setState({ loaded: true, loggedIn: false });
      }
    });
  }

  render() {
    if (this.state.loaded) {
      return (
        <NavigationContainer
          ref={this.NavigationRef}
          onReady={() => {
            this.setState({
              routeName: this.NavigationRef.current?.getCurrentRoute()?.name,
            });
          }}
          onStateChange={async (state) => {
            const previous = this.state.routeName;
            const current = this.NavigationRef.current?.getCurrentRoute()?.name;
            if (previous !== current) {
              Analytics.screenChange(current || 'undefined');
            }
            this.setState({ routeName: current });
          }}
        >
          <Stack.Navigator
            screenOptions={{ headerShown: false }}
            initialRouteName={this.state.loggedIn ? 'Home' : 'Login'}
          >
            <Stack.Screen
              name="Login"
              options={{
                animationTypeForReplace: this.state.loggedIn ? 'pop' : 'push',
              }}
            >
              {(props) => <LoginScreen navigation={props.navigation} />}
            </Stack.Screen>
            <Stack.Screen name="Home" component={HomeScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      );
    }
    return null;
  }
}

export default App;
