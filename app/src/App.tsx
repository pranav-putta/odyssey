import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {
  createStackNavigator,
  StackNavigationOptions,
} from '@react-navigation/stack';
import LaunchScreen from './screens/launch/LaunchScreen';
import LoginScreen from './screens/login/LoginScreen';
import HomeScreen from './screens/home/HomeScreen';
import routes from './routes/routes';
import BillDetailScreen from './screens/home/bill/BillDetailScreen';

type ScreenOptions = {
  launchOptions: StackNavigationOptions;
  loginOptions: StackNavigationOptions;
  homeOptions: StackNavigationOptions;
  billDetailsOptions: StackNavigationOptions;
};

const options: ScreenOptions = {
  launchOptions: {
    headerShown: false,
  },
  loginOptions: {
    headerShown: false,
  },
  homeOptions: {
    headerShown: false,
  },
  billDetailsOptions: {
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
        <Stack.Screen
          name={routes.home}
          component={HomeScreen}
          options={options.homeOptions}
        />
        <Stack.Screen
          name={routes.billDetails}
          component={BillDetailScreen}
          options={options.billDetailsOptions}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
