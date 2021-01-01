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
import { Browser } from '../../../util/Browser';
import Space from '../../../components/Space';
import { FeedService } from '../../../redux/feed/feed';
import store from '../../../redux/store';
import { UIStatus } from '../../../redux/ui/ui.types';
import { FeedStatus } from '../../../redux/feed/feed.types';
import { connect } from 'react-redux';
import { User } from '../../../redux/models/user';
import Skeleton, { Skeletons } from '../../../components/Skeleton';

const width = Dimensions.get('screen').width;
const height = Dimensions.get('screen').height;

interface Props {
  navigation: StackNavigationProp<BillScreenStackParamList, any>;
  currentUser: User;
  feed: Bill[];
  representatives: Representative[];
  status: FeedStatus;
}

interface State {
  currentTab: BillTabKey;
  repSelected: boolean;
  repSelectedInfo: Representative | undefined;
  likedBills: Bill[];
  notification?: Notification;
  progress: boolean;
}

enum BillTabKey {
  new = 'new',
  liked = 'liked',
}

// carousel for new tab
const BillCarousel = (props: {
  bills: Bill[];
  onPress: (item: { bill: Bill; category: Category }) => void;
}) => {
  const scrollX = React.useRef(new Animated.Value(0)).current;
  return (
    <Carousel
      enableMomentum={true}
      lockScrollWhileSnapping={true}
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
      containerCustomStyle={{ maxHeight: height * 0.625 }}
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

function mapStoreToProps() {
  let feed = store.getState().feed;
  return feed;
}

class BillDiscoverScreen extends React.Component<Props, State> {
  componentDidMount() {
    this.loadData();
  }

  loadData = async (): Promise<void> => {
    // TODO: Notification and app rating bar
    store.dispatch(FeedService.refresh());
  };

  constructor(props: any) {
    super(props);

    this.state = {
      currentTab: BillTabKey.new,
      repSelected: false,
      repSelectedInfo: undefined,
      likedBills: [],
      progress: false,
    };

    this.loadData = this.loadData.bind(this);
  }

  render() {
    let loading = this.props.status === FeedStatus.refreshing;
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <NotificationCard
          notification={this.state.notification}
          dismiss={() => {
            this.setState({ notification: undefined });
          }}
        />
        <ScrollView
          style={{ flex: 1 }}
          overScrollMode={'never'}
          refreshControl={
            <RefreshControl onRefresh={this.loadData} refreshing={loading} />
          }
        >
          <Headline />
          <Skeleton
            styles={{
              paddingHorizontal: '10%',
              height: '20%',
              marginTop: '2.5%',
            }}
            loading={loading}
            skeleton={Skeletons.RepCard}
          >
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'space-between',
                marginHorizontal: '10%',
                marginTop: '2.5%',
              }}
            >
              {this.props.representatives.map((rep, i) => (
                <>
                  <RepCard
                    key={rep.member_url}
                    clicked={() => {
                      this.props.navigation.push('Rep', { rep: rep });
                    }}
                    rep={rep}
                  />
                  {i !== this.props.representatives.length ? (
                    <Space height={'1.5%'} />
                  ) : null}
                </>
              ))}
            </View>
          </Skeleton>
          <ProgressHUD visible={loading} />
          <Space height={'2.5%'} />
          <Space height={'1.5%'} />
          <BillCarousel
            bills={this.props.feed}
            onPress={(item) => {
              this.props.navigation.push('Details', item);
            }}
          />
        </ScrollView>
        <Space height={'11%'} />
      </SafeAreaView>
    );
  }
}

function Headline() {
  return (
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
          Browser.openURL(
            'https://www.odysseyapp.us/about-us.htm',
            false,
            false
          );
        }}
      >
        <Icon name="info" type="feather" color="#2196f3" />
      </TouchableOpacity>
    </View>
  );
}

function RepCard(props: {
  rep: Representative;
  clicked: (rep: Representative) => void;
}) {
  const { rep, clicked } = props;
  let title = () => {
    if (rep.chamber === 'house') {
      return 'My Representative';
    } else if (rep.chamber === 'senate') {
      return 'My Senator';
    } else {
      return 'Undefined';
    }
  };
  return (
    <TouchableOpacity
      style={styles.repcard}
      onPress={() => {
        clicked(rep);
      }}
    >
      <View style={{ flexDirection: 'row' }}>
        <SharedElement id={`rep.${rep.member_url}.photo`}>
          <FastImage
            style={styles.repcardImage}
            source={{
              uri: rep.picture_url,
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
            {rep.name}
          </Text>
        </View>
        <View style={{ flex: 1 }} />
        <View
          style={{
            position: 'absolute',
            right: 0,
            alignSelf: 'center',
            padding: 5,
            borderRadius: 20,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Icon
            type={'feather'}
            name={'arrow-right'}
            color={'black'}
            solid={true}
            size={20}
            containerStyle={{}}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}

function TabItem(props: { label: string; active: boolean }) {
  return (
    <TouchableScale
      style={styles.tabButton}
      disabled={props.active}
      onPress={() => {}}
    >
      <Text
        style={[
          styles.tabText,
          { color: props.active ? 'black' : colors.darkGray },
        ]}
      >
        {props.label}
      </Text>
    </TouchableScale>
  );
}
function TabBar(props: { current: BillTabKey }) {
  // generates tab bar { 'new' , 'liked' }
  return (
    <View style={styles.topTabs}>
      <TabItem active={props.current == BillTabKey.new} label={'New'} />
      <TabItem active={props.current == BillTabKey.liked} label={'Liked'} />
    </View>
  );
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
    alignItems: 'center',
    justifyContent: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
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
export default connect(mapStoreToProps)(BillDiscoverScreen);
