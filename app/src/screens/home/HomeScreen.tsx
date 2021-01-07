import React from 'react';
import { View, StyleSheet } from 'react-native';
import TabBar, { TabKey, TabModel } from '../../components/TabBar';
import BillScreen from './bill/BillTab';
import SearchScreen from './search/SearchTab';
import { StackNavigationProp } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ProfileTab from './profile/ProfileTab';
import { RouteProp } from '@react-navigation/native';
import { HomeNavigation, HomeParams } from '../../App';
import { NotificationHandler } from '../../util/';
import inAppMessaging from '@react-native-firebase/in-app-messaging';
import LikedScreen from './liked/LikedScreen';
import { StorageService } from '../../redux/storage';
import NotificationModal from '../../components/NotificationModal';
import store from '../../redux/store';
import { Notification } from '../../redux/models';
import { connect } from 'react-redux';

type State = {
  showTabs: boolean;
  selectedTab: string;
};
type Props = {
  navigation: HomeNavigation;
  route: HomeParams;
  notification?: Notification;
};

const tabs: TabModel[] = [
  {
    icon: { name: 'home', type: 'font-awesome-5' },
    label: 'Home',
    tkey: TabKey.bills,
    width: 40,
  },
  {
    icon: { name: 'search', type: 'feather' },
    label: 'Search',
    color: '#9c27b0',
    tkey: TabKey.search,
    width: 70,
  },
  {
    icon: { name: 'heart', type: 'feather' },
    label: 'Liked',
    tkey: TabKey.liked,
    color: '#ff5252',
    width: 50,
  },
  {
    icon: { name: 'user', type: 'feather' },
    label: 'Me',
    color: 'black',
    tkey: TabKey.profile,
    width: 50,
  },
];

type HomeScreenTabParams = {
  Bills: undefined;
  Search: undefined;
  Liked: undefined;
  Profile: undefined;
};

export type ProfileTabScreenProps = StackNavigationProp<
  HomeScreenTabParams,
  'Profile'
>;
export type ProfileScreenRouteProps = RouteProp<HomeScreenTabParams, 'Profile'>;

const Tab = createBottomTabNavigator<HomeScreenTabParams>();

function mapStoreToProps() {
  let notification = NotificationHandler.latestNotification();
  return { notification };
}

class HomeScreen extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      showTabs: true,
      selectedTab: TabKey.bills,
    };
  }

  componentDidMount() {
    this.initialize();
  }

  private async initialize() {
    // check for notifications
    await inAppMessaging().setMessagesDisplaySuppressed(false);

    let response = await NotificationHandler.requestUserPermission();
    if (response) {
      await NotificationHandler.subscribeToAlerts();
      await NotificationHandler.createForegroundListener();
    }
  }

  render() {
    return (
      <>
        <NotificationModal notification={this.props.notification} />
        <View style={styles.container}>
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
            <Tab.Screen name="Liked">{(props) => <LikedScreen />}</Tab.Screen>
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
        </View>
      </>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
});

export default connect(mapStoreToProps)(HomeScreen);
