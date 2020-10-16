import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RouteProp } from '@react-navigation/native';
import {
  createStackNavigator,
  StackNavigationProp,
} from '@react-navigation/stack';
import { TransitionIOSSpec } from '@react-navigation/stack/lib/typescript/src/TransitionConfigs/TransitionSpecs';
import React from 'react';
import { createSharedElementStackNavigator } from 'react-navigation-shared-element';
import { Bill } from '../../../models/Bill';
import { Category } from '../../../models/Category';
import BillDiscoverScreen from './BillDiscoverScreen';
import BillInfoScreen from './BillInfoScreen';
import BillVotingScreen from './BillVotingScreen';

interface Props {
  navigation: BottomTabNavigationProp<any, any>;
  toggleTabs: (show: boolean) => void;
}
interface State {}

export type BillScreenStackParamList = {
  Discover: undefined;
  Info: {
    bill: Bill;
    category: Category;
  };
  Vote: {
    bill: Bill;
    category: Category;
  };
};

export type BillInfoScreenProps = StackNavigationProp<
  BillScreenStackParamList,
  'Info'
>;
export type BillDiscoverScreenProps = StackNavigationProp<
  BillScreenStackParamList,
  'Discover'
>;
export type BillVotingScreenProps = StackNavigationProp<
  BillScreenStackParamList,
  'Vote'
>;
export type BillInfoScreenRouteProp = RouteProp<
  BillScreenStackParamList,
  'Info'
>;
export type BillDiscoverScreenRouteProp = RouteProp<
  BillScreenStackParamList,
  'Discover'
>;

export type BillVotingScreenRouteProp = RouteProp<
  BillScreenStackParamList,
  'Vote'
>;

const Stack = createSharedElementStackNavigator<BillScreenStackParamList>({
  name: 'BillScreen',
});

export default class BillScreen extends React.Component<Props, State> {
  render() {
    return (
      <Stack.Navigator
        headerMode="none"
        screenOptions={{
          cardStyleInterpolator: ({ current }) => ({
            cardStyle: {
              opacity: current.progress,
            },
          }),
        }}
      >
        <Stack.Screen
          name="Discover"
          options={{ headerShown: false }}
          listeners={{
            focus: () => {
              this.props.toggleTabs(true);
            },
          }}
          component={BillDiscoverScreen}
        />
        <Stack.Screen
          name="Info"
          options={{ headerShown: false }}
          component={BillInfoScreen}
          listeners={{
            focus: () => {
              this.props.toggleTabs(false);
            },
          }}
          sharedElementsConfig={(route, otherRoute, showing) => {
            const { bill } = route.params;
            return [
              {
                id: `bill.${bill.number}.image`,
                animation: 'fade-in',
                resize: 'auto',
              },
            ];
          }}
        />
        <Stack.Screen name="Vote" component={BillVotingScreen} options={{}} />
      </Stack.Navigator>
    );
  }
}
