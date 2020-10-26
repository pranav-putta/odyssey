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
} from 'react-native';
import Carousel from 'react-native-snap-carousel';
import { Icon } from 'react-native-elements';
import { colors } from '../../../assets';
import {
  fetchCategories,
  fetchRepresentatives,
  Representative,
} from '../../../models';
import { Bill } from '../../../models/Bill';
import { likedBills, randomBills, refresh } from '../../../util';
import BillCard, { BillCardSpecs } from './BillCard';
import FastImage from 'react-native-fast-image';
// @ts-ignore
import TouchableScale from 'react-native-touchable-scale';
import { StackNavigationProp } from '@react-navigation/stack';
import { BillScreenStackParamList } from './BillTab';
import { Category } from '../../../models/Category';
import ProgressHUD from '../../../components/ProgressHUD';
import { Measure } from './BillDetailsStack';
import { SharedElement } from 'react-navigation-shared-element';
import { TouchableOpacity } from 'react-native-gesture-handler';

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
  categories: any;
  focused: boolean;
  likedBills: Bill[];
  progress: boolean;
}

enum BillTabKey {
  new = 'new',
  liked = 'liked',
}

// carousel for new tab
const BillCarousel = (props: {
  bills: Bill[];
  categories: any;
  onPress: (
    item: { bill: Bill; category: Category },
    image: Measure,
    container: Measure,
    content: Measure
  ) => void;
  focused: boolean;
  carouselRef: React.RefObject<Carousel<Bill>>;
}) => {
  const scrollX = React.useRef(new Animated.Value(0)).current;
  const measure = async (obj: React.RefObject<View>) => {
    return new Promise<Measure>((resolve, reject) => {
      obj.current?.measure((x, y, w, h, px, py) => [
        resolve({ x: x, y: y, width: w, height: h, pageX: px, pageY: py }),
      ]);
    });
  };
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
        let category = props.categories[item.item.category];
        return (
          <BillCard
            index={item.index}
            bill={item.item}
            scrollX={scrollX}
            category={category}
            onPress={async (image, container, content) => {
              const imageDims = await measure(container);
              const containerDims = await measure(container);
              const contentDims = await measure(content);
              console.log(imageDims);
              props.onPress(
                { bill: item.item, category: category },
                imageDims,
                containerDims,
                contentDims
              );
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
      autoplay={props.focused}
      autoplayInterval={10000}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
        { useNativeDriver: true }
      )}
    />
  );
};

export default class BillDiscoverScreen extends React.Component<Props, State> {
  private carousel = React.createRef<Carousel<Bill>>();

  componentDidMount() {
    this.loadData();
  }

  loadData = async () => {
    this.setState({ progress: true });
    if (!this.state.loaded || this.state.refreshing) {
      await refresh();
      let data = await fetchRepresentatives();
      this.setState({ representatives: data });
      data = await fetchCategories();
      this.setState({ categories: data });
      let bills = await randomBills();
      let lbills = await likedBills();
      this.setState({
        bills: bills,
        loaded: true,
        likedBills: lbills,
        progress: true,
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
      categories: {},
      focused: this.props.navigation.isFocused(),
      likedBills: [],
      progress: false,
    };

    this.props.navigation.addListener('blur', () => {
      this.setState({ focused: false });
    });
    this.props.navigation.addListener('focus', () => {
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
    if (this.state.currentTab == BillTabKey.new) {
      return (
        <BillCarousel
          carouselRef={this.carousel}
          bills={this.state.bills}
          categories={this.state.categories}
          onPress={(item, image, container, content) => {
            this.props.navigation.push('Details', {
              bill: item.bill,
              category: item.category,
              imageDims: image,
              textCardDims: container,
              cardDims: content,
            });
          }}
          focused={this.state.focused}
        />
      );
    } else if (this.state.currentTab == BillTabKey.liked) {
      return (
        <BillCarousel
          carouselRef={this.carousel}
          bills={this.state.likedBills}
          categories={this.state.categories}
          onPress={(item, image, container, content) => {
            this.props.navigation.push('Details', {
              bill: item.bill,
              category: item.category,
              imageDims: image,
              textCardDims: container,
              cardDims: content,
            });
          }}
          focused={this.state.focused}
        />
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
        <ScrollView
          contentContainerStyle={{ flex: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={() => {
                this.setState({ refreshing: true });
                refresh().finally(() => {
                  this.loadData().finally(() => {
                    this.carousel.current?.snapToItem(0, true);
                    this.setState({ refreshing: false });
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
              <Icon name="info" type="feather" />
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
          <ProgressHUD visible={this.state.progress} />
          <Text>Loading...</Text>
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
