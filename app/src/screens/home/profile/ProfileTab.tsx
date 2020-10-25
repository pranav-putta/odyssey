import { RouteProp } from '@react-navigation/native';
import {
  createStackNavigator,
  StackNavigationProp,
} from '@react-navigation/stack';
import React from 'react';
import { ProfileTabScreenProps } from '../HomeScreen';
import EditScreen from './EditScreen';
import ProfileScreen from './ProfileScreen';
import SettingsScreen from './SettingsScreen';

type ProfileTabStackParams = {
  Profile: undefined;
  Settings: undefined;
  Edit: undefined;
};

const Stack = createStackNavigator<ProfileTabStackParams>();

export type ProfileScreenProps = StackNavigationProp<
  ProfileTabStackParams,
  'Profile'
>;
export type ProfileSettingsScreenProps = StackNavigationProp<
  ProfileTabStackParams,
  'Settings'
>;
export type ProfileEditScreenProps = StackNavigationProp<
  ProfileTabStackParams,
  'Edit'
>;

export type ProfileScreenParams = RouteProp<ProfileTabStackParams, 'Profile'>;

export default function ProfileTab(props: {
  navigation: ProfileTabScreenProps;
  toggleTabs: (show: boolean) => void;
}) {
  return (
    <Stack.Navigator
      headerMode="none"
      screenOptions={{
        transitionSpec: {
          open: { animation: 'timing', config: { duration: 150 } },
          close: { animation: 'timing', config: { duration: 150 } },
        },
        cardStyleInterpolator: ({ current }) => ({
          cardStyle: {
            opacity: current.progress,
          },
        }),
      }}
    >
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        listeners={{
          focus: () => {
            props.toggleTabs(true);
          },
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        listeners={{
          focus: () => {
            props.toggleTabs(false);
          },
        }}
      />
      <Stack.Screen
        name="Edit"
        component={EditScreen}
        listeners={{
          focus: () => {
            props.toggleTabs(false);
          },
        }}
      />
    </Stack.Navigator>
  );
}
