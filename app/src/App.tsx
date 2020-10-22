import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import {
  createStackNavigator,
  StackNavigationOptions,
  StackNavigationProp,
} from '@react-navigation/stack';
import LaunchScreen from './screens/launch/LaunchScreen';
import LoginScreen from './screens/login/LoginScreen';
import HomeScreen from './screens/home/HomeScreen';
import routes from './routes/routes';

type ScreenOptions = {
  launchOptions: StackNavigationOptions;
  loginOptions: StackNavigationOptions;
  homeOptions: StackNavigationOptions;
};

const options: ScreenOptions = {
  launchOptions: {
    header: undefined,
    headerShown: false,
    gestureEnabled: false,
  },
  loginOptions: {
    header: undefined,
    gestureEnabled: false,
    headerShown: false,
  },
  homeOptions: {
    header: undefined,
    gestureEnabled: false,
    headerShown: false,
  },
};

type AppStackParams = {
  Launch: undefined;
  Login: undefined;
  Home: undefined;
};

export type LaunchScreenProps = StackNavigationProp<AppStackParams, 'Launch'>;
export type HomeScreenProps = StackNavigationProp<AppStackParams, 'Home'>;
export type LoginScreenProps = StackNavigationProp<AppStackParams, 'Login'>;

const Stack = createStackNavigator<AppStackParams>();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Launch"
          component={LaunchScreen}
          options={options.launchOptions}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={options.loginOptions}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={options.homeOptions}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
