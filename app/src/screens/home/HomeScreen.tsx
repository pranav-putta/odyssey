import React from 'react';
import { View, StatusBar, StyleSheet, Alert, Platform } from 'react-native';
import TabBar, { TabKey, TabModel } from '../../components/TabBar';
import BillScreen from './bill/BillTab';
import SearchScreen from './search/SearchTab';
import { StackNavigationProp } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ProfileTab from './profile/ProfileTab';
import { RouteProp } from '@react-navigation/native';
import { HomeParams } from '../../App';

type State = {
  showTabs: boolean;
  selectedTab: string;
};
type Props = {
  route: HomeParams;
};

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

type HomeScreenTabParams = {
  Bills: undefined;
  Search: undefined;
  Profile: undefined;
};

export type ProfileTabScreenProps = StackNavigationProp<
  HomeScreenTabParams,
  'Profile'
>;
export type ProfileScreenRouteProps = RouteProp<HomeScreenTabParams, 'Profile'>;

const Tab = createBottomTabNavigator<HomeScreenTabParams>();
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
          <Tab.Screen name="Bills">
            {(props) => (
              <BillScreen
                navigation={props.navigation}
                toggleTabs={(show: boolean) => {
                  this.setState({ showTabs: show });
                }}
              />
            )}
          </Tab.Screen>
          <Tab.Screen name="Search">
            {(props) => (
              <SearchScreen
                navigation={props.navigation}
                toggleTabs={(show: boolean) => {
                  this.setState({ showTabs: show });
                }}
              />
            )}
          </Tab.Screen>

          <Tab.Screen name="Profile">
            {(props) => (
              <ProfileTab
                navigation={props.navigation}
                toggleTabs={(show: boolean) => {
                  this.setState({ showTabs: show });
                }}
              />
            )}
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
