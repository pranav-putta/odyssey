import React from 'react';
import {View, StatusBar, StyleSheet} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import BillScreen from './bill/BillScreen';
import DiscussionScreen from './discussion/DiscussionScreen';

type State = {};
type Props = {};

const Tab = createBottomTabNavigator();
class HomeScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }
  render() {
    return (
      <View style={styles.container}>
        <StatusBar barStyle={'dark-content'} />
        <Tab.Navigator>
          <Tab.Screen name="Bills" component={BillScreen} />
          <Tab.Screen name="Discussion" component={DiscussionScreen} />
        </Tab.Navigator>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default HomeScreen;
