import React from 'react';
import { View, StatusBar, StyleSheet, Alert, Platform } from 'react-native';
import TabBar, { TabKey, TabModel } from '../../components/TabBar';
import BillScreen from './bill/BillTab';
import ProfileScreen from './profile/ProfileScreen';
import SearchScreen from './search/SearchTab';
import { StackNavigationProp } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

type State = {
  showTabs: boolean;
  selectedTab: string;
};
type Props = { navigation: StackNavigationProp<any, any> };

const tabs: TabModel[] = [
  {
    icon: { name: 'trello', type: 'feather' },
    label: 'Bills',
    tkey: TabKey.bills,
    width: 40,
  },
  {
    icon: { name: 'search', type: 'feather' },
    label: 'Search',
    tkey: TabKey.search,
    width: 70,
  },
  {
    icon: { name: 'user', type: 'feather' },
    label: 'Me',
    tkey: TabKey.profile,
    width: 50,
  },
];

const Tab = createBottomTabNavigator();
class HomeScreen extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      showTabs: true,
      selectedTab: TabKey.bills,
    };
  }

  render() {
    return (
      <View style={StyleSheet.absoluteFillObject}>
        <Tab.Navigator
          tabBar={(props) => (
            <TabBar
              show={this.state.showTabs}
              current={this.state.selectedTab}
              tabPressed={(tab) => {
                this.setState({ selectedTab: tab });
                props.navigation.navigate(tab);
              }}
              tabs={tabs}
            />
          )}
        >
          <Tab.Screen name={TabKey.bills}>
            {(props) => (
              <BillScreen
                navigation={props.navigation}
                toggleTabs={(show: boolean) => {
                  this.setState({ showTabs: show });
                }}
              />
            )}
          </Tab.Screen>
          <Tab.Screen name={TabKey.search}>
            {(props) => (
              <SearchScreen
                navigation={props.navigation}
                toggleTabs={(show: boolean) => {
                  this.setState({ showTabs: show });
                }}
              />
            )}
          </Tab.Screen>

          <Tab.Screen name={TabKey.profile}>
            {(props) => <ProfileScreen navigation={props.navigation} />}
          </Tab.Screen>
        </Tab.Navigator>
        {Platform.select({
          ios: (
            <StatusBar
              barStyle={'dark-content'}
              hidden={false}
              translucent={true}
            />
          ),
        })}
      </View>
    );
  }
}

export default HomeScreen;
