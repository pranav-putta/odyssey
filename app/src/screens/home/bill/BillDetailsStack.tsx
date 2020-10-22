import { RouteProp } from '@react-navigation/native';
import {
  createStackNavigator,
  StackNavigationProp,
} from '@react-navigation/stack';
import React from 'react';
import { Bill } from '../../../models/Bill';
import { Category } from '../../../models/Category';
import BillInfoScreen from './BillInfoScreen';
import { BillDetailStackProps, BillDetailStackRouteProps } from './BillTab';
import VoteScreen from './BillVotingScreen';
import ComposeCommentScreen from './ComposeCommentScreen';

interface Props {
  navigation: BillDetailStackProps;
  route: BillDetailStackRouteProps;
}
interface State {}

export type BillDetailStackParams = {
  Info: {
    bill: Bill;
    category: Category;
  };
  Vote: {
    bill: Bill;
    category: Category;
  };
  Comment: {
    bill: Bill;
  };
};

export type BillDetailsInfoScreenProps = StackNavigationProp<
  BillDetailStackParams,
  'Info'
>;
export type BillDetailsVoteScreenProps = StackNavigationProp<
  BillDetailStackParams,
  'Vote'
>;
export type BillDetailsCommentScreenProps = StackNavigationProp<
  BillDetailStackParams,
  'Comment'
>;

export type BillDetailInfoScreenRouteProps = RouteProp<
  BillDetailStackParams,
  'Info'
>;
export type BillDetailVoteScreenRouteProps = RouteProp<
  BillDetailStackParams,
  'Vote'
>;
export type BillDetailCommentScreenRouteProps = RouteProp<
  BillDetailStackParams,
  'Comment'
>;

const Stack = createStackNavigator<BillDetailStackParams>();

export default class BillDetailStack extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

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
          name="Info"
          options={{ headerShown: false }}
          initialParams={this.props.route.params}
          component={BillInfoScreen}
        />
        <Stack.Screen
          name="Vote"
          component={VoteScreen}
          initialParams={this.props.route.params}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Comment"
          component={ComposeCommentScreen}
          initialParams={this.props.route.params}
          options={{
            transitionSpec: {
              open: { animation: 'timing', config: { duration: 300 } },
              close: { animation: 'timing', config: { duration: 300 } },
            },
            gestureDirection: 'vertical',
            cardStyleInterpolator: ({ current, layouts }) => ({
              cardStyle: {
                transform: [
                  {
                    translateY: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [layouts.screen.height, 0],
                    }),
                  },
                ],
              },
            }),
          }}
        />
      </Stack.Navigator>
    );
  }
}
