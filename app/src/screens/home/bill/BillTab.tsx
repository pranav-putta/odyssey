import React from 'react';
import {View} from 'react-native';
import {createSharedElementStackNavigator} from 'react-navigation-shared-element';
import {billTabRoutes} from '../../../routes/routes';
import BillListScreen from './BillListScreen';
import BillDetailScreen from './BillDetailScreen';
import BillItem from './components/BillItem';
import {
  TransitionSpecs,
  HeaderStyleInterpolators,
  StackCardStyleInterpolator,
} from '@react-navigation/stack';

export type BillTabParams = {
  list: undefined;
  detail: {
    item: BillItem;
  };
};
const Stack = createSharedElementStackNavigator<BillTabParams>();

class BillTab extends React.Component {
  s: StackCardStyleInterpolator;

  constructor(props: any) {
    super(props);
    this.s = ({current, next, layouts}) => {
      return {
        cardStyle: {
          transform: [
            {
              translateY: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [layouts.screen.height, 0],
              }),
            },
            {
              scale: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0.2, 1],
              }),
            },
            {
              scale: next
                ? next.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 0.8],
                  })
                : 1,
            },
          ],
        },
        overlayStyle: {
          opacity: current.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 0.5],
          }),
        },
      };
    };
  }

  render() {
    return (
      <Stack.Navigator initialRouteName={billTabRoutes.list}>
        <Stack.Screen
          name={billTabRoutes.list}
          component={BillListScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={billTabRoutes.detail}
          component={BillDetailScreen}
          options={{
            headerShown: false,
            gestureDirection: 'vertical',
            transitionSpec: {
              open: TransitionSpecs.TransitionIOSSpec,
              close: TransitionSpecs.TransitionIOSSpec,
            },
            headerStyleInterpolator: HeaderStyleInterpolators.forFade,
            cardStyleInterpolator: this.s,
          }}
          initialParams={{item: undefined}}
          sharedElementsConfig={(route, otherRoute, showing) => {
            const {item} = route.params;
            return [{id: `item.${item.id}.photo`, animation: 'move'}];
          }}
        />
      </Stack.Navigator>
    );
  }
}

export default BillTab;
