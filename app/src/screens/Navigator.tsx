import {
  NavigationContainer,
  NavigationContainerRef,
  RouteProp,
  StackActions,
  useNavigation,
} from '@react-navigation/native';
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
import { UIScreenCode } from '../redux/ui/ui.types';

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
  const authStatus = useSelector((state: AppState) => state.auth.status);
  const servicesLoaded = useSelector(
    (state: AppState) => state.ui.servicesLoaded
  );

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
      case AuthStatus.unknown:
        return null;
      default:
        screen = 'Home';
        component = HomeScreen;
        break;
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

  let route = mapAuthToRoute();
  if (!route || !servicesLoaded) {
    BootSplash.show();
    return null;
  }

  BootSplash.hide({ duration: 350 });
  // TODO: add analytics
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {route}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export module Odyssey {
  export const navigationRef = React.createRef<NavigationContainerRef>();
  export function navigate(name: string) {
    navigationRef.current?.navigate(name);
  }

  export function push(name: string) {
    navigationRef.current?.dispatch(StackActions.push(name));
  }
}
