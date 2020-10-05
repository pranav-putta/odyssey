import React from 'react';
import { View, StatusBar, StyleSheet, Alert, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import BillScreen from './bill/BillScreen';
import DiscussionScreen from './community/CommunityScreen';
import TabBar, { TabKey } from '../../components/TabBar';
import { TabRouter } from '@react-navigation/native';
import BillListScreen from './bill/BillScreen';
import ProfileScreen from './profile/ProfileScreen';
import CommunityScreen from './community/CommunityScreen';
import { StackNavigationProp } from '@react-navigation/stack';

type State = {
  showTabs: boolean;
  current: string;
};
type Props = { navigation: StackNavigationProp<any, any> };

const Tab = createBottomTabNavigator();
class HomeScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      showTabs: true,
      current: TabKey.bills,
    };
  }

  tabPressed = (tab: string) => {
    this.setState({ current: tab });
  };

  currentScreen = () => {
    switch (this.state.current) {
      case TabKey.bills: {
        return (
          <BillListScreen
            navigation={this.props.navigation}
            toggleTabs={() => {
              this.setState({ showTabs: !this.state.showTabs });
            }}
          />
        );
      }
      case TabKey.profile: {
        return <ProfileScreen navigation={this.props.navigation} />;
      }
      case TabKey.search: {
        return <CommunityScreen />;
      }
      default: {
        return <View></View>;
      }
    }
  };

  render() {
    return (
      <View style={styles.container}>
        {Platform.select({
          ios: (
            <StatusBar
              barStyle={'dark-content'}
              hidden={false}
              translucent={true}
            />
          ),
        })}
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
