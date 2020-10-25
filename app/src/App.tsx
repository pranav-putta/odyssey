import React from 'react';
import { NavigationContainer, RouteProp } from '@react-navigation/native';
import {
  createStackNavigator,
  StackNavigationOptions,
  StackNavigationProp,
} from '@react-navigation/stack';
import LoginScreen from './screens/login/LoginScreen';
import HomeScreen from './screens/home/HomeScreen';
import auth from '@react-native-firebase/auth';
import SplashScreen from 'react-native-splash-screen';
import Global from './util/global';
import AsyncStorage from '@react-native-community/async-storage';
import { storage } from './assets';

type Props = {
  navigation: any;
};
type State = {
  loggedIn: boolean;
};

type AppStackParams = {
  Login: undefined;
  Home: {
    callback: () => void;
  };
};
export type HomeNavigation = StackNavigationProp<AppStackParams, 'Home'>;
export type LoginNavigation = StackNavigationProp<AppStackParams, 'Login'>;
export type HomeParams = RouteProp<AppStackParams, 'Home'>;

const Stack = createStackNavigator<AppStackParams>();

class App extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      loggedIn: false,
    };

    auth().onAuthStateChanged((user) => {
      if (!user) {
        this.init();
      }
    });
  }

  componentDidMount() {
    this.init();
  }

  async init() {
    let signedIn = (await AsyncStorage.getItem(storage.userSignedIn)) == 'true';

    await Global.setCategories();
    SplashScreen.hide();
    if (signedIn) {
      this.setState({ loggedIn: true });
    } else {
      this.setState({ loggedIn: false });
    }
  }

  render() {
    return (
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{ headerShown: false }}
          initialRouteName={this.state.loggedIn ? 'Home' : 'Login'}
        >
          {this.state.loggedIn ? (
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              initialParams={{ callback: () => {} }}
              options={{
                animationTypeForReplace: this.state.loggedIn ? 'pop' : 'push',
              }}
            />
          ) : (
            <Stack.Screen name="Login">
              {(props) => (
                <LoginScreen
                  navigation={props.navigation}
                  callback={() => {
                    this.init();
                  }}
                />
              )}
            </Stack.Screen>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
}

export default App;
