import React from 'react';
import {
  SafeAreaView,
  RefreshControl,
  Text,
  View,
  ScrollView,
  StyleSheet,
  Image,
  Dimensions,
  Animated,
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
import { randomBills, refresh } from '../../../util';
import BillCard, { BillCardSpecs } from './components/BillCard';
import RepExpandedCard from './components/RepExpandedCard';
// @ts-ignore
import TouchableScale from 'react-native-touchable-scale';
import { StackNavigationProp } from '@react-navigation/stack';
import { BillScreenStackParamList } from './BillScreen';
import { Category } from '../../../models/Category';

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
}

enum BillTabKey {
  new = 'new',
  liked = 'liked',
}

// carousel for new tab
const NewTab = (props: {
  bills: Bill[];
  categories: any;
  onPress: (item: { bill: Bill; category: Category }) => void;
  focused: boolean;
}) => {
  const scrollX = React.useRef(new Animated.Value(0)).current;
  return (
    <Carousel
      enableMomentum={true}
      lockScrollWhileSnapping={true}
      contentContainerCustomStyle={{ paddingTop: '2.5%' }}
      data={props.bills}
      renderItem={(item: { item: Bill; index: number }) => {
        let category = props.categories[item.item.category];
        return (
          <BillCard
            index={item.index}
            bill={item.item}
            scrollX={scrollX}
            category={category}
            onPress={() => {
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
  componentDidMount() {
    this.loadData();
  }

  loadData = async () => {
    if (!this.state.loaded || this.state.refreshing) {
      let data = await fetchRepresentatives();
      this.setState({ representatives: data });
      data = await fetchCategories();
      this.setState({ categories: data });
      randomBills()
        .then((result) => {
          this.setState({ bills: result });
          this.setState({ loaded: true });
        })
        .catch(() => {
          this.setState({ bills: [] });
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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 24, marginBottom: '50%' }}>No Likes Yet!</Text>
      </View>
    );
  };

  // get the current tab selected and return corresponding view
  currentTabContent = () => {
    if (this.state.currentTab == BillTabKey.new) {
      return (
        <NewTab
          bills={this.state.bills}
          categories={this.state.categories}
          onPress={(item) => {
            this.props.navigation.push('Info', item);
          }}
          focused={this.state.focused}
        />
      );
    } else if (this.state.currentTab == BillTabKey.liked) {
      return this.likedTab();
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

    return (
      <TouchableScale
        style={styles.repcard}
        onPress={() => {
          this.setState({
            repSelectedInfo: {
              picture_url: props.picture_url,
              name: props.name,
              phoneNumber: props.phoneNumber,
              address: props.address,
              chamber: props.chamber,
            },
          });
          this.setState({ repSelected: true });
        }}
      >
        <View style={{ flexDirection: 'row' }}>
          <Image
            style={styles.repcardImage}
            source={{
              uri: props.picture_url,
            }}
          />
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
                  this.loadData();
                  this.setState({ refreshing: false });
                });
              }}
            />
          }
        >
          <RepExpandedCard
            visible={this.state.repSelected}
            info={this.state.repSelectedInfo}
            dismiss={() => {
              this.setState({ repSelected: false });
            }}
          />
          <Text style={styles.discover}>Discover</Text>
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
          <View style={{ width: '100%', height: '11%', bottom: 0 }} />
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
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
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
    marginLeft: '10%',
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
