import { RouteProp } from '@react-navigation/native';
import {
  createStackNavigator,
  StackNavigationProp,
} from '@react-navigation/stack';
import React from 'react';
import { Bill } from '../../../models/Bill';
import { Comment } from '../../../models/BillData';
import { Category } from '../../../models/Category';
import BillCommentFullScreeen from './BillCommentFullScreen';
import BillInfoScreen from './BillInfoScreen';
import { BillDetailStackProps, BillDetailStackRouteProps } from './BillTab';
import VoteScreen from './BillVotingScreen';
import ComposeCommentScreen from './ComposeCommentScreen';

interface Props {
  navigation: BillDetailStackProps;
  route: BillDetailStackRouteProps;
}
interface State {}

export interface Measure {
  x: number;
  y: number;
  width: number;
  height: number;
  pageX: number;
  pageY: number;
}

export type BillDetailStackParams = {
  Info: {
    bill: Bill;
    category: Category;
    imageDims: Measure;
    textCardDims: Measure;
    cardDims: Measure;
  };
  Vote: {
    bill: Bill;
    category: Category;
    refresh?: () => void;
  };
  Comment: {
    bill: Bill;
  };
  CommentFullScreen: {
    comment: Comment;
    voteColor: string;
    voteText: string;
    formattedDate: string;
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

export type BillDetailsCommentFullScreenProps = StackNavigationProp<
  BillDetailStackParams,
  'CommentFullScreen'
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

export type BillDetailCommentFullScreenRouteProps = RouteProp<
  BillDetailStackParams,
  'CommentFullScreen'
>;

const Stack = createStackNavigator<BillDetailStackParams>();

export default class BillDetailStack extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    return (
      <Stack.Navigator headerMode="none" screenOptions={{}}>
        <Stack.Screen
          name="Info"
          options={{
            headerShown: false,
            cardStyle: { backgroundColor: 'transparent' },
          }}
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
        <Stack.Screen
          name="CommentFullScreen"
          component={BillCommentFullScreeen}
        />
      </Stack.Navigator>
    );
  }
}
