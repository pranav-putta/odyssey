import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import TabBar, { TabKey, TabModel } from '../../components/TabBar';
import { StackNavigationProp } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ProfileTab from './profile/ProfileTab';
import { HomeNavigation, HomeParams } from '../../App';
import { NotificationHandler } from '../../util/';
import inAppMessaging from '@react-native-firebase/in-app-messaging';
import LikedScreen from './liked/LikedScreen';
import NotificationModal from '../../components/NotificationModal';
import store from '../../redux/store';
import { Notification } from '../../redux/models';
import { connect, useSelector } from 'react-redux';
import BillTab from './bill/BillTab';
import SearchTab from './search/SearchTab';
import { createSharedElementStackNavigator } from 'react-navigation-shared-element';
import BillDetailStack from './bill/BillDetailsStack';
import {
  UIStatusCode,
  UIStatus,
  UIScreen,
  UIScreenCode,
} from '../../redux/ui/ui.types';
import { BillMetadata } from '../../models/Bill';
import { BillStatusCode } from '../../redux/bill/bill.types';
import { AppState } from '../../redux/reducer';
import { BillService } from '../../redux/bill';
import {
  NavigationContainer,
  StackActions,
  useNavigation,
} from '@react-navigation/native';
import { Odyssey } from '../Navigator';

type State = {
  showTabs: boolean;
  selectedTab: string;
};
type Props = {
  notification?: Notification;
  screen: UIScreen;
  status: UIStatus;
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

type HomeScreenStackParams = {
  Home: undefined;
  Bill: undefined;
};

const Tab = createBottomTabNavigator<HomeScreenTabParams>();
const Stack = createSharedElementStackNavigator<HomeScreenStackParams>();

type HomeStackNavigation = StackNavigationProp<HomeScreenStackParams, 'Home'>;
type BillStackNavigation = StackNavigationProp<HomeScreenStackParams, 'Bill'>;

function mapStoreToProps() {
  let notification = NotificationHandler.latestNotification();
  let { screen, status } = store.getState().ui;

  return { notification, screen, status };
}

class HomeScreen extends React.PureComponent<Props, State> {
  private screen: UIScreen;

  constructor(props: Props) {
    super(props);

    this.state = {
      showTabs: true,
      selectedTab: TabKey.bills,
    };

    this.screen = store.getState().ui.screen;
  }

  componentDidMount() {
    this.initialize();
  }

  componentDidUpdate() {
    const { screen } = this.props;

    if (this.screen.code != screen.code) {
      switch (screen.code) {
        case UIScreenCode.bill:
          Odyssey.navigationRef.current?.dispatch(StackActions.push('Bill'));
          break;
        default:
          return;
      }
    }
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
    switch (this.props.status.code) {
      case UIStatusCode.error:
        Alert.alert('Error', this.props.status.message);
        break;
    }
    return (
      <>
        <NotificationModal notification={this.props.notification} />
        <NavigationContainer independent={true} ref={Odyssey.navigationRef}>
          <Stack.Navigator headerMode="none">
            <Stack.Screen
              component={HomeScreenTabs}
              name={'Home'}
              options={{ animationTypeForReplace: 'pop' }}
            />
            <Stack.Screen
              listeners={{
                blur: () => {
                  store.dispatch(BillService.closeBill());
                },
              }}
              name="Bill"
              sharedElements={(_, other, showing) => {
                if (other.name === 'Discover' && showing) {
                  const bill = store.getState().bill.status.bill;
                  if (bill) {
                    return [{ id: `bill.${bill.number}.photo` }];
                  }
                }
              }}
              component={BillDetailStack}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </>
    );
  }
}

function HomeScreenTabs(props: { navigation: HomeStackNavigation }) {
  let [tab, setTab] = React.useState<string>(TabKey.bills);
  let status = useSelector((state: AppState) => state.ui.status);

  return (
    <Tab.Navigator
      tabBar={(props) => (
        <TabBar
          show={true}
          current={tab}
          tabPressed={(tab) => {
            setTab(tab);
            props.navigation.navigate(tab);
          }}
          tabs={tabs}
        />
      )}
    >
      <Tab.Screen name="Bills" component={BillTab} />
      <Tab.Screen name="Search" component={SearchTab} />
      <Tab.Screen name="Liked" component={LikedScreen} />
      <Tab.Screen name="Profile" component={ProfileTab} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
});

export default connect(mapStoreToProps)(HomeScreen);
