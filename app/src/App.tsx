import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {
  createStackNavigator,
  StackNavigationOptions,
} from '@react-navigation/stack';
import LaunchScreen from './screens/launch/LaunchScreen';
import LoginScreen from './screens/login/LoginScreen';

export enum routes {
  launch = 'launch',
  login = 'login',
}

type ScreenOptions = {
  launchOptions: StackNavigationOptions;
  loginOptions: StackNavigationOptions;
};

const options: ScreenOptions = {
  launchOptions: {
    headerShown: false,
  },
  loginOptions: {
    headerShown: false,
  },
};

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name={routes.launch}
          component={LaunchScreen}
          options={options.launchOptions}
        />
        <Stack.Screen
          name={routes.login}
          component={LoginScreen}
          options={options.loginOptions}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
