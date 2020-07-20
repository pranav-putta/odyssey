import React from 'react';
import {View} from 'react-native';
import {createSharedElementStackNavigator} from 'react-navigation-shared-element';
import {billTabRoutes} from '../../../routes/routes';
import BillListScreen from './BillListScreen';
import BillDetailScreen from './BillModal';
import BillItem from './components/BillItem';
import {TransitionSpecs} from '@react-navigation/stack';

export type BillTabParams = {
  list: undefined;
  detail: {
    item: BillItem;
  };
};
const Stack = createSharedElementStackNavigator<BillTabParams>({});

class BillTab extends React.Component {
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
