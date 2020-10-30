import React from 'react';
import {
  SafeAreaView,
  RefreshControl,
  Text,
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  Animated,
  Linking,
  Alert,
} from 'react-native';
import Carousel from 'react-native-snap-carousel';
import { Icon } from 'react-native-elements';
import { colors } from '../../../assets';
import {
  fetchRepresentatives,
  getAppLaunchCount,
  getNotification,
  removeNotification,
  Representative,
} from '../../../models';
import { Bill } from '../../../models/Bill';
import { likedBills, loadBillFeed, refresh } from '../../../util';
import BillCard, { BillCardSpecs } from './BillCard';
import FastImage from 'react-native-fast-image';
// @ts-ignore
import TouchableScale from 'react-native-touchable-scale';
import { StackNavigationProp } from '@react-navigation/stack';
import { BillScreenStackParamList } from './BillTab';
import { Category } from '../../../models/Category';
import ProgressHUD from '../../../components/ProgressHUD';
import Rate from 'react-native-rate';
import { SharedElement } from 'react-navigation-shared-element';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Config } from '../../../util/Config';
import { Analytics } from '../../../util/AnalyticsHandler';
import { Notification } from '../../../models/Notification';
import NotificationCard from '../../../components/NotificationCard';

const width = Dimensions.get('screen').width;
const height = Dimensions.get('screen').height;

interface Props {
  navigation: StackNavigationProp<BillScreenStackParamList, any>;
}

interface State {
  bills: Bill[];
  currentTab: BillTabKey;
  repSelected: boolean;
  repSelectedInfo: Representative | undefined;
  refreshing: boolean;
  loaded: boolean;
  representatives: Representative[];
  focused: boolean;
  likedBills: Bill[];
  progress: boolean;
  notification?: Notification;
}

enum BillTabKey {
  new = 'new',
  liked = 'liked',
}

// carousel for new tab
const BillCarousel = (props: {
  bills: Bill[];
  onPress: (item: { bill: Bill; category: Category }) => void;
  focused: boolean;
  carouselRef: React.RefObject<Carousel<Bill>>;
}) => {
  const scrollX = React.useRef(new Animated.Value(0)).current;
  return (
    <Carousel
      ref={props.carouselRef}
      enableMomentum={true}
      lockScrollWhileSnapping={true}
      contentContainerCustomStyle={{
        paddingTop: '2.5%',
      }}
      data={props.bills}
      renderItem={(item: { item: Bill; index: number }) => {
        let category = Config.getTopics()[item.item.category];
        return (
          <BillCard
            index={item.index}
            bill={item.item}
            scrollX={scrollX}
            category={category}
            onPress={async (image, container, content) => {
              Analytics.billClick(item.item);
              props.onPress({ bill: item.item, category: category });
            }}
          />
        );
      }}
      sliderWidth={width}
      itemWidth={width * 0.8}
      itemHeight={height}
      layout={'default'}
      inactiveSlideScale={0.9}
      inactiveSlideOpacity={0.7}
      centerContent={true}
      loop={false}
      autoplayInterval={10000}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
        { useNativeDriver: true }
      )}
    />
  );
};

export default class BillDiscoverScreen extends React.Component<Props, State> {
  private newCarousel = React.createRef<Carousel<Bill>>();
  private likedCarousel = React.createRef<Carousel<Bill>>();

  componentDidMount() {
    this.loadData();
    this.props.navigation.addListener('focus', () => {
      this.checkNotification();
    });
  }
  private async checkNotification() {
    let notif = await getNotification();
    if (notif) {
      this.setState({ notification: notif });
      removeNotification();
    }
  }

  async calculateShowAppStoreRateProb(): Promise<boolean> {
    let ct = await getAppLaunchCount();
    // sigmoid function
    let prev = 3 * Math.pow(ct - 1, 1 / 3) - 4;
    let next = 3 * Math.pow(ct, 1 / 3) - 4;
    if (Math.floor(prev) !== Math.floor(next) && next > 0 && next % 2 == 0) {
      return true;
    }
    return false;
  }

  loadData = async (): Promise<void> => {
    if (!this.state.loaded || this.state.refreshing) {
      return new Promise<void>((resolve, reject) => {
        this.setState({ progress: true }, async () => {
          await refresh();
          let data = await fetchRepresentatives();
          this.setState({ representatives: data });
          let bills = await loadBillFeed();
          let lbills = await likedBills();
          this.setState({
            bills: bills,
            loaded: true,
            likedBills: lbills,
            progress: false,
          });
          resolve();
          this.checkNotification();

          let shouldShowRate = await this.calculateShowAppStoreRateProb();
          if (shouldShowRate) {
            Rate.rate(
              {
                preferInApp: true,
                AppleAppID: '1537850349',
                fallbackPlatformURL: 'https:/www.odysseyapp.us/feedback.html',
              },
              (success) => {
                Analytics.ratingChosen(success);
              }
            );
          }

          if (this.state.currentTab == BillTabKey.new) {
            this.newCarousel.current?.startAutoplay();
            this.likedCarousel.current?.stopAutoplay();
          } else {
            this.likedCarousel.current?.startAutoplay();
            this.newCarousel.current?.stopAutoplay();
          }
        });
      });
    }
  };

  constructor(props: any) {
    super(props);

    this.state = {
      refreshing: false,
      loaded: false,
      representatives: [],
      bills: [],
      currentTab: BillTabKey.new,
      repSelected: false,
      repSelectedInfo: undefined,
      focused: this.props.navigation.isFocused(),
      likedBills: [],
      progress: false,
    };

    this.props.navigation.addListener('blur', () => {
      this.setState({ focused: false });
      this.newCarousel.current?.stopAutoplay();
      this.likedCarousel.current?.stopAutoplay();
    });
    this.props.navigation.addListener('focus', () => {
      if (this.state.currentTab == BillTabKey.new) {
        this.newCarousel.current?.startAutoplay();
        this.likedCarousel.current?.stopAutoplay();
      } else {
        this.likedCarousel.current?.startAutoplay();
        this.newCarousel.current?.stopAutoplay();
      }
      this.setState({ focused: true });
    });
  }
  // generates top tab item { 'new' , 'liked' }
  tabItem = (label: string, key: BillTabKey) => {
    const active = key == this.state.currentTab;
    return (
      <TouchableScale
        style={styles.tabButton}
        disabled={active}
        onPress={() => {
          if (key == BillTabKey.liked && key != this.state.currentTab) {
            this.likedCarousel.current?.stopAutoplay();
            this.newCarousel.current?.startAutoplay();
          } else if (key == BillTabKey.new && key != this.state.currentTab) {
            this.likedCarousel.current?.startAutoplay();
            this.newCarousel.current?.stopAutoplay();
          }
          this.setState({ currentTab: key });
        }}
      >
        <Text
          style={[
            styles.tabText,
            { color: active ? 'black' : colors.darkGray },
          ]}
        >
          {label}
        </Text>
      </TouchableScale>
    );
  };

  // creates tab bar
  tabBar = () => {
    return (
      <View style={styles.topTabs}>
        {this.tabItem('New', BillTabKey.new)}
        {this.tabItem('Liked', BillTabKey.liked)}
      </View>
    );
  };

  // view for liked tab
  likedTab = () => {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text style={{ fontSize: 24, marginBottom: '50%' }}>No Likes Yet!</Text>
      </View>
    );
  };

  // get the current tab selected and return corresponding view
  currentTabContent = () => {
    if (
      this.state.currentTab == BillTabKey.new &&
      this.state.bills.length > 0
    ) {
      return (
        <BillCarousel
          carouselRef={this.newCarousel}
          bills={this.state.bills}
          onPress={(item) => {
            this.props.navigation.push('Details', {
              bill: item.bill,
              category: item.category,
            });
          }}
          focused={this.state.focused}
        />
      );
    } else if (
      this.state.currentTab == BillTabKey.liked &&
      this.state.likedBills.length > 0
    ) {
      return (
        <BillCarousel
          carouselRef={this.likedCarousel}
          bills={this.state.likedBills}
          onPress={(item) => {
            this.props.navigation.push('Details', {
              bill: item.bill,
              category: item.category,
            });
          }}
          focused={this.state.focused}
        />
      );
    } else {
      return (
        <View
          style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}
        >
          <Text
            style={{ fontFamily: 'Futura', fontSize: 20, fontWeight: '400' }}
          >
            Nothing here!
          </Text>
        </View>
      );
    }
  };

  RepCard = (props: Representative) => {
    let title = () => {
      if (props.chamber === 'house') {
        return 'My Representative';
      } else if (props.chamber === 'senate') {
        return 'My Senator';
      } else {
        return 'Undefined';
      }
    };
    if (props) {
      return (
        <TouchableScale
          style={styles.repcard}
          onPress={() => {
            this.props.navigation.push('Rep', { rep: props });
          }}
        >
          <View style={{ flexDirection: 'row' }}>
            <SharedElement id={`rep.${props.member_url}.photo`}>
              <FastImage
                style={styles.repcardImage}
                source={{
                  uri: props.picture_url,
                }}
              />
            </SharedElement>
            <View
              style={{
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                alignSelf: 'flex-end',
                marginLeft: '5%',
              }}
            >
              <Text
                style={{
                  fontFamily: 'Roboto',
                  fontSize: 17,
                  fontWeight: 'bold',
                  color: 'black',
                }}
              >
                {title()}
              </Text>
              <Text
                numberOfLines={1}
                style={{
                  fontFamily: 'Roboto',
                  fontWeight: 'normal',
                  color: 'black',
                }}
              >
                {props.name}
              </Text>
            </View>
            <Icon
              type={'feather'}
              name={'send'}
              color={'black'}
              size={20}
              containerStyle={{
                flex: 1,
                alignSelf: 'center',
              }}
              style={{ alignSelf: 'flex-end' }}
            />
          </View>
        </TouchableScale>
      );
    }
  };

  discover = () => {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <NotificationCard
          notification={this.state.notification}
          dismiss={() => {
            this.setState({ notification: undefined });
          }}
        />
        <ScrollView
          contentContainerStyle={{ flex: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={() => {
                this.setState({ refreshing: true }, () => {
                  this.loadData().finally(() => {
                    this.setState({ refreshing: false });
                    this.newCarousel.current?.snapToItem(0, true);
                    this.likedCarousel.current?.snapToItem(0, true);
                  });
                });
              }}
            />
          }
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginHorizontal: '10%',
            }}
          >
            <Text style={styles.discover}>Discover</Text>
            <TouchableOpacity
              onPress={() => {
                Linking.canOpenURL(
                  'https://www.odysseyapp.us/about-us.html'
                ).then((val) => {
                  if (val) {
                    Linking.openURL('https://www.odysseyapp.us/about-us.html');
                  }
                });
              }}
            >
              <Icon name="info" type="feather" color="#2196f3" />
            </TouchableOpacity>
          </View>
          <View
            style={{
              marginTop: '2%',
              marginBottom: '6%',
              paddingHorizontal: '4%',
              borderRadius: 10,
              flexDirection: 'column',
            }}
          >
            <View style={{ flexDirection: 'row' }}>
              {this.RepCard(this.state.representatives[0])}
            </View>
            <View style={{ flexDirection: 'row' }}>
              {this.RepCard(this.state.representatives[1])}
            </View>
          </View>
          {this.tabBar()}
          {this.currentTabContent()}
          <View style={{ width: '100%', height: '7.5%', bottom: 0 }} />
        </ScrollView>
      </SafeAreaView>
    );
  };

  render() {
    if (this.state.loaded && this.state.bills) {
      return <View style={styles.container}>{this.discover()}</View>;
    } else {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'white',
          }}
        >
          <Text>Loading...</Text>
          <ProgressHUD visible={true} />
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    zIndex: 0,
    backgroundColor: 'white',
  },
  logoImage: {
    height: '2%',
    width: '2%',
    marginLeft: '6%',
    resizeMode: 'center',
    borderRadius: 20,
    padding: '10%',
    zIndex: 2,
  },
  textInput: {
    backgroundColor: colors.textInputBackground,
    marginHorizontal: '10%',
    marginVertical: '2.5%',
    paddingHorizontal: '5%',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '5%',
  },
  tabText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  topTabs: {
    flexDirection: 'row',
    marginLeft: '10%',
    marginBottom: '0.5%',
  },
  helloText: {
    fontSize: 46,
    fontWeight: '300',
  },
  nameText: { fontSize: 18, fontWeight: 'bold' },
  discover: {
    fontSize: 30,
    fontFamily: 'Futura',
    fontWeight: '500',
    textAlign: 'left',
    marginTop: '0%',
  },
  discoverCaption: {
    marginTop: '3%',
    fontFamily: 'Futura',
    fontSize: 20,
    fontWeight: '400',
  },
  repcard: {
    padding: 5,
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    borderRadius: 10,
    flex: 1,
    marginHorizontal: '5%',
    marginTop: 5,
  },
  repcardImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  repcardText: {
    fontSize: 12,
    fontWeight: '300',
    fontFamily: 'Roboto-Thin',
    textAlign: 'left',
    color: 'white',
  },
});
