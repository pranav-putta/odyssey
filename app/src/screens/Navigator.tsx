import { NavigationContainer, RouteProp } from '@react-navigation/native';
import {
  StackNavigationProp,
  createStackNavigator,
} from '@react-navigation/stack';
import React, { useEffect } from 'react';
import HomeScreen from './home/HomeScreen';
import BootSplash from 'react-native-bootsplash';
import { useSelector } from 'react-redux';
import { AppState } from '../redux/reducer';
import { AuthStatus } from '../redux/auth/auth.types';
import SetupScreen from './setup/SetupScreen';
import LoginScreen from './login/LoginScreen';
import { Services } from '../util/services/Services';
import { StorageService } from '../redux/storage';

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

const Stack = createStackNavigator<AppStackParams>();
type Route = 'Home' | 'Setup' | 'Login';

export default function Navigator() {
  const servicesLoaded = useSelector(
    (state: AppState) => state.ui.servicesLoaded
  );
  const authStatus = useSelector((state: AppState) => state.auth.status);

  const mapAuthToRoute = () => {
    let screen: Route = 'Login';
    let component: React.ComponentType<any> = HomeScreen;
    switch (authStatus) {
      case AuthStatus.unauthenticated:
        screen = 'Login';
        component = LoginScreen;
        break;
      case AuthStatus.authenticatedSetupRequired:
        screen = 'Setup';
        component = SetupScreen;
        break;
      default:
        screen = 'Home';
        component = HomeScreen;
    }

    return (
      <Stack.Screen
        name={screen}
        component={component}
        options={{
          animationTypeForReplace: screen == 'Login' ? 'pop' : 'push',
        }}
      />
    );
  };

  if (!servicesLoaded || authStatus === AuthStatus.unknown) {
    BootSplash.show();
    return null;
  }


  BootSplash.hide({ duration: 350 });
  // TODO: add analytics
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {mapAuthToRoute()}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
