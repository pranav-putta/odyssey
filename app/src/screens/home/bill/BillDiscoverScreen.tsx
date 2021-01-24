import React, { useEffect, useState } from 'react';
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
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
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
import { UIService } from '../../../redux/ui/ui';
import { BlurView } from '@react-native-community/blur';
import { UIScreenCode } from '../../../redux/ui/ui.types';
import Modal from 'react-native-modal';
import { StorageService } from '../../../redux/storage';

const width = Dimensions.get('screen').width;
const height = Dimensions.get('screen').height;

const Specs = {
  filterHeight: 40,
  filterModalPadding: 15,
};

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
  swipeDownShowing: boolean;
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

  private swipeDownTimeout: NodeJS.Timeout | undefined = undefined;
  private listRef = React.createRef<FlatList>();

  startSwipDownTimeout() {
    let tutorial = store.getState().storage.tutorialSeen;

    if (!tutorial) {
      this.swipeDownTimeout = setTimeout(() => {
        this.setState({ swipeDownShowing: true });
        store.dispatch(StorageService.tutorialSeen());
      }, 10 * 1000);
    }
  }

  componentDidMount() {
    if (!this.props.refreshed) {
      setTimeout(() => {
        this.loadData();
      }, 500);
    }

    this.startSwipDownTimeout();
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
      swipeDownShowing: false,
    };

    this.loadData = this.loadData.bind(this);
    this.lastStatus = props.status;
  }

  componentDidUpdate() {
    if (
      this.lastStatus !== FeedStatus.refreshed &&
      this.props.status === FeedStatus.refreshed
    ) {
      // if the screen just finished refreshing, scroll to the first bill
      this.listRef.current?.scrollToIndex({ index: 0, animated: true });
    }
    this.lastStatus = this.props.status;
  }

  render() {
    let loading = this.props.status === FeedStatus.refreshing;

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <StatusBar barStyle={'dark-content'} />
        <Headline loading={loading} reps={this.props.representatives} />
        <FlatList
          ref={this.listRef}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={this.loadData} />
          }
          data={this.props.feed}
          decelerationRate={'fast'}
          onScroll={(_) => {
            if (this.swipeDownTimeout) clearTimeout(this.swipeDownTimeout);
            this.setState({ swipeDownShowing: false }, () => {
              let tutorial = store.getState().storage.tutorialSeen;
              if (!tutorial) {
                this.startSwipDownTimeout();
              }
            });
          }}
          keyExtractor={(item) => item.actions_hash}
          contentContainerStyle={{ paddingTop: '5%', paddingBottom: '10%' }}
          showsVerticalScrollIndicator={false}
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
        <SwipeDownModal active={this.state.swipeDownShowing} />
      </SafeAreaView>
    );
  }
}

let swipeDownOpacity = new Animated.Value(0);

function SwipeDownModal(props: { active: boolean }) {
  const { active } = props;

  let AV = Animated.createAnimatedComponent(Animatable.View);

  useEffect(() => {
    let val = active ? 1 : 0;

    Animated.timing(swipeDownOpacity, {
      toValue: val,
      useNativeDriver: true,
      duration: active ? 250 : 100,
    }).start();
  });
  return (
    <AV
      style={{
        position: 'absolute',
        width: 150,
        height: 70,
        bottom: '14%',
        borderRadius: 5,
        alignSelf: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        overflow: 'hidden',
        opacity: swipeDownOpacity,
      }}
      animation={'bounce'}
      iterationCount={'infinite'}
      duration={2500}
      iterationDelay={5000}
    >
      <BlurView
        style={{
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        blurType={'xlight'}
        blurAmount={5}
      >
        <Icon type={'feather'} name={'arrow-down'} />
        <Space height={2.5} />
        <Text style={{ fontFamily: 'Futura', fontSize: 16 }}>Swipe Down</Text>
      </BlurView>
    </AV>
  );
}

function Headline(props: { reps: Representative[]; loading: boolean }) {
  return (
    <View
      style={{
        backgroundColor: 'white',
        paddingHorizontal: '5%',
        paddingBottom: '2.5%',
        shadowColor: 'black',
        shadowOpacity: 0.15,
        zIndex: 3,
        shadowOffset: { width: 0, height: 5 },
        maxHeight: '15%',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
        }}
      >
        <Text style={styles.discover}>Discover</Text>
        <Filter />
      </View>
      <Reps representatives={props.reps} loading={props.loading} />
    </View>
  );
}

function Reps(props: { representatives: Representative[]; loading: boolean }) {
  return (
    <View
      style={{
        flexDirection: 'row',
      }}
    >
      {props.representatives.map((rep, i) => {
        return (
          <>
            <RepCard
              rep={rep}
              clicked={() => {
                store.dispatch(
                  UIService.setScreen({ code: UIScreenCode.rep, rep: rep })
                );
              }}
            />
            {i != props.representatives.length - 1 ? <Space width={5} /> : null}
          </>
        );
      })}
    </View>
  );
}

function RepCard(props: { rep: Representative; clicked: () => void }) {
  const { rep, clicked } = props;
  let title = () => {
    if (rep.chamber === 'house') {
      return 'My Rep';
    } else if (rep.chamber === 'senate') {
      return 'My Senator';
    } else {
      return 'Undefined';
    }
  };
  return (
    <TouchableOpacity
      style={{
        flex: 1,
        alignItems: 'center',
        borderRadius: 10,
        flexDirection: 'row',
        padding: '1%',
        marginTop: '1.5%',
      }}
      onPress={clicked}
    >
      <FastImage
        source={{ uri: rep.picture_url }}
        style={styles.repcardImage}
      />
      <Space width={'5%'} />
      <View
        style={{ flex: 1, height: '100%', flexDirection: 'column-reverse' }}
      >
        <Text
          style={{ fontWeight: 'bold', fontSize: 16 }}
          numberOfLines={1}
          adjustsFontSizeToFit={true}
        >
          {rep.name}
        </Text>
        <Text adjustsFontSizeToFit={true} style={{ fontFamily: 'Futura' }}>
          {title()}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function Filter(props: {}) {
  let [modalShown, setModalShown] = React.useState(false);

  return (
    <View
      style={{
        maxHeight: Specs.filterHeight,
        zIndex: 10000,
      }}
    >
      <TouchableOpacity
        style={{
          backgroundColor: '#eceff1',
          flexDirection: 'row',
          paddingHorizontal: 10,
          paddingVertical: 7.5,
          borderRadius: 5,
          alignItems: 'center',
        }}
        onPress={() => {
          //setModalShown(!modalShown);
        }}
      >
        <Icon
          name={'fire'}
          type={'font-awesome-5'}
          color={'#ff3d00'}
          size={12}
        />
        <Space width={5} />
        <Text
          style={{ fontSize: 12, fontWeight: '500', fontFamily: 'Roboto' }}
          adjustsFontSizeToFit={true}
        >
          Hot Bills
        </Text>
        <Space width={10} />
        <Icon name={'chevron-down'} type={'feather'} size={14} solid={true} />
      </TouchableOpacity>
      <FilterModal shown={modalShown} />
    </View>
  );
}

function FilterModal(props: { shown: boolean }) {
  if (props.shown) {
    return (
      <View
        style={{
          position: 'absolute',
          width: '100%',
          height: 100,
          top: Specs.filterHeight,
          backgroundColor: colors.blueGray,
          right: 0,
          borderRadius: 5,
          zIndex: 10000,
        }}
      ></View>
    );
  } else {
    return null;
  }
}

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
    alignItems: 'center',
    backgroundColor: '#eceff1',
    borderRadius: 15,
    flex: 1,
    height: 100,
  },
  repcardImage: {
    width: 40,
    height: 40,
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
