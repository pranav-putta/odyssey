import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RouteProp } from '@react-navigation/native';
import {
  createStackNavigator,
  StackNavigationProp,
} from '@react-navigation/stack';
import React from 'react';
import { Bill } from '../../../models/Bill';
import { Category } from '../../../models/Category';
import BillDetailStack from '../bill/BillDetailsStack';
import SearchBarScreen from './SearchBarScreen';
interface Props {
  navigation: BottomTabNavigationProp<any, any>;
}
interface State {}

export type BillScreenStackParamList = {
  Search: undefined;
  Details: {
    bill: Bill;
    category: Category;
  };
};

export type BillSearchDetailsScreenProps = StackNavigationProp<
  BillScreenStackParamList,
  'Details'
>;
export type BillSearchScreenProps = StackNavigationProp<
  BillScreenStackParamList,
  'Search'
>;
export type BillSearchDetailsScreenRouteProp = RouteProp<
  BillScreenStackParamList,
  'Details'
>;
export type BillSearchScreenRouteProp = RouteProp<
  BillScreenStackParamList,
  'Search'
>;

const Stack = createStackNavigator<BillScreenStackParamList>();

export default class SearchTab extends React.Component<Props, State> {
  render() {
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
          name="Search"
          options={{ headerShown: false }}
          listeners={{
            focus: () => {},
          }}
          component={SearchBarScreen}
        />
      </Stack.Navigator>
    );
  }
}
