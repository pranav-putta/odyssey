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
  StatusBar,
  Alert,
  FlatList,
} from 'react-native';
import Carousel from 'react-native-snap-carousel';
import { Icon } from 'react-native-elements';
import { colors } from '../../../assets';
import { Representative } from '../../../models';
import { Bill, BillHandler } from '../../../models/Bill';
import BillCard, { BillCardSpecs } from './BillCard';
import FastImage from 'react-native-fast-image';
// @ts-ignore
import { StackNavigationProp } from '@react-navigation/stack';
import { BillScreenStackParamList } from './BillTab';
import { Category } from '../../../models/Category';
import ProgressHUD from '../../../components/ProgressHUD';
import { SharedElement } from 'react-navigation-shared-element';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Config } from '../../../util/Config';
import { Analytics } from '../../../util/services/AnalyticsHandler';
import { Browser } from '../../../util/Browser';
import Space from '../../../components/Space';
import { FeedService } from '../../../redux/feed';
import store from '../../../redux/store';
import { FeedStatus } from '../../../redux/feed/feed.types';
import { connect } from 'react-redux';
import { User } from '../../../redux/models/user';
import Skeleton, { Skeletons } from '../../../components/Skeleton';
import { BillService } from '../../../redux/bill';
import { UIService } from '../../../redux/ui/ui';
import { BlurView } from '@react-native-community/blur';

const width = Dimensions.get('screen').width;
const height = Dimensions.get('screen').height;

interface Props {
  navigation: StackNavigationProp<BillScreenStackParamList, any>;
  currentUser: User;
  feed: Bill[];
  representatives: Representative[];
  status: FeedStatus;
  refreshed: boolean;
}

interface State {
  currentTab: BillTabKey;
  repSelected: boolean;
  repSelectedInfo: Representative | undefined;
  likedBills: Bill[];
  progress: boolean;
}

enum BillTabKey {
  new = 'new',
  liked = 'liked',
}

function mapStoreToProps() {
  let feed = store.getState().feed;
  let refreshed = store.getState().ui.firstDataRefresh;
  return { ...feed, refreshed };
}

class BillDiscoverScreen extends React.Component<Props, State> {
  private lastStatus: FeedStatus;
  private carouselRef: React.RefObject<Carousel<Bill>>;

  componentDidMount() {
    if (!this.props.refreshed) this.loadData();
  }

  loadData = async (): Promise<void> => {
    // TODO: Notification and app rating bar
    store.dispatch(FeedService.refresh());
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      currentTab: BillTabKey.new,
      repSelected: false,
      repSelectedInfo: undefined,
      likedBills: [],
      progress: false,
    };

    this.loadData = this.loadData.bind(this);
    this.lastStatus = props.status;
    this.carouselRef = React.createRef<Carousel<Bill>>();
  }

  componentDidUpdate() {
    if (
      this.lastStatus !== FeedStatus.refreshed &&
      this.props.status === FeedStatus.refreshed
    ) {
      // if the screen just finished refreshing, scroll to the first bill
      this.carouselRef.current?.snapToItem(0);
    }
    this.lastStatus = this.props.status;
  }

  render() {
    let loading = this.props.status === FeedStatus.refreshing;

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <StatusBar barStyle={'dark-content'} />
        <Headline />
        <FlatList
          data={this.props.feed}
          decelerationRate={'fast'}
          keyExtractor={(item) => item.actions_hash}
          contentContainerStyle={{ paddingTop: '2.5%' }}
          snapToInterval={BillCardSpecs.height + BillCardSpecs.verticalSpacing}
          renderItem={({ item, index }) => (
            <BillCard
              bill={item}
              category={Config.getTopics()[item.category]}
              index={index}
              onPress={() => {
                Analytics.billClick(item);
                store.dispatch(UIService.launchBill(BillHandler.meta(item)));
              }}
            />
          )}
        />
        <Space height={'8.5%'} />
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
        marginHorizontal: '5%',
      }}
    >
      <Text style={styles.discover}>Discover</Text>
      <TouchableOpacity
        onPress={() => {
          Browser.openURL(
            'https://www.odysseyapp.us/about-us/index.html',
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

function Reps(props: {
  representatives: Representative[];
  loading: boolean;
  navigation: StackNavigationProp<BillScreenStackParamList, any>;
}) {
  return (
    <Skeleton
      styles={{
        paddingHorizontal: '10%',
        height: '20%',
        marginTop: '2.5%',
      }}
      loading={props.loading && props.representatives.length == 0}
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
        {props.representatives.map((rep, i) => (
          <>
            <RepCard
              key={rep.member_url}
              clicked={() => {
                props.navigation.push('Rep', { rep: rep });
              }}
              rep={rep}
            />
            {i !== props.representatives.length ? <Space height={10} /> : null}
          </>
        ))}
      </View>
    </Skeleton>
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

// carousel for new tab
const BillCarousel = (props: {
  bills: Bill[];
  onPress: (item: { bill: Bill; category: Category }) => void;
}) => {
  const scrollX = React.useRef(new Animated.Value(0)).current;
  return (
    <View
      style={{
        paddingBottom: '5%',
        flex: 1,
      }}
    >
      <View
        style={{
          backgroundColor: '#eceff1',
          flexDirection: 'row',
          marginHorizontal: '5%',
          marginTop: '4%',
          marginBottom: '3%',
          paddingHorizontal: '5%',
          paddingVertical: '2.5%',
          borderRadius: 5,
        }}
      >
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Icon
            name={'fire'}
            type={'font-awesome-5'}
            size={14}
            color={'black'}
          />
          <Space width={7.5} />
          <Text
            style={{
              color: 'black',
              fontFamily: 'Futura',
              fontWeight: 'bold',
              fontSize: 12,
            }}
          >
            HOT POSTS
          </Text>
        </TouchableOpacity>
      </View>
      <Animated.FlatList
        nestedScrollEnabled={true}
        data={props.bills}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        keyExtractor={(item: Bill) => item.actions_hash}
        contentContainerStyle={{
          maxHeight: height * 0.5,
          paddingLeft: 10,
          paddingRight: 50,
        }}
        renderItem={(item: { item: Bill; index: number }) => {
          let category = Config.getTopics()[item.item.category];
          return (
            <>
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
            </>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    zIndex: 0,
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
    fontSize: 36,
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
