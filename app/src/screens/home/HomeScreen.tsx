import React from 'react';
import {View, StatusBar, StyleSheet, Alert} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import BillScreen from './bill/BillListScreen';
import DiscussionScreen from './community/DiscussionScreen';
import TabBar, {TabKey} from '../../components/TabBar';
import {TabRouter} from '@react-navigation/native';
import BillListScreen from './bill/BillListScreen';
import ProfileScreen from './profile/ProfileScreen';
import {StackNavigationProp} from '@react-navigation/stack';

type State = {
  showTabs: boolean;
  current: TabKey;
};
type Props = {navigation: StackNavigationProp<any, any>};

const Tab = createBottomTabNavigator();
class HomeScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      showTabs: true,
      current: TabKey.bills,
    };
  }

  tabPressed = (tab: TabKey) => {
    this.setState({current: tab});
  };

  currentScreen = () => {
    switch (this.state.current) {
      case TabKey.bills: {
        return (
          <BillListScreen
            navigation={this.props.navigation}
            toggleTabs={() => {
              this.setState({showTabs: !this.state.showTabs});
            }}
          />
        );
      }
      case TabKey.profile: {
        return <ProfileScreen navigation={this.props.navigation} />;
      }
      default: {
        return <View></View>;
      }
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <TabBar
          show={this.state.showTabs}
          current={this.state.current}
          tabPressed={this.tabPressed}
        />
        {this.currentScreen()}
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
