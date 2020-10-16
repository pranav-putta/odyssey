import React from 'react';
import {
  StyleSheet,
  View,
  Image,
  Text,
  Dimensions,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native';
import { colors } from '../../../assets';
import * as Animatable from 'react-native-animatable';
import BillSmallCard from './components/BillSmallCard';
import BillItem from './components/BillItem';
import Carousel from 'react-native-snap-carousel';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import BillDetailScreen, { Measure } from './BillDetailScreen';
import TouchableScale from 'react-native-touchable-scale';
import RepExpandedCard from './components/RepExpandedCard';
import { Icon } from 'react-native-elements';
import {
  fetchCategories,
  fetchRepresentatives,
  fetchUser,
  Representative,
} from '../../../models';
import { randomBills, refresh } from '../../../util';
import { Bill } from '../../../models/Bill';
import functions from '@react-native-firebase/functions';
import { Category } from '../../../models/Category';
import Axios from 'axios';

enum BillTabKey {
  new = 'new',
  liked = 'liked',
}

type State = {
  bills: Bill[];
  search: string;
  selectedBill: Bill | undefined;
  billMeasure: Measure | undefined;
  showDetails: boolean;
  detailsExpanded: boolean;
  currentTab: BillTabKey;
  currentCard: number;
  repSelected: boolean;
  repSelectedInfo: Representative | undefined;
  refreshing: boolean;
  loaded: boolean;
  representatives: Representative[];
  categories: any;
};

type Props = {
  toggleTabs: () => void;
  navigation: StackNavigationProp<any, any>;
};

const width = Dimensions.get('screen').width;
const height = Dimensions.get('screen').height;

class FeedScreen extends React.Component<Props, State> {
  AnimatableImage: Animatable.AnimatableComponent<any, any>;
  billsRef = React.createRef<Carousel<Text>>();

  componentDidMount() {
    this.loadData();
  }

  loadData = async () => {
    let data = await fetchRepresentatives();
    this.setState({ representatives: data });
    data = await fetchCategories();
    this.setState({ categories: data });
    this.setState({ loaded: true });
    randomBills()
      .then((result) => {
        this.setState({ bills: result });
      })
      .catch(() => {
        this.setState({ bills: [] });
      });
  };

  constructor(props: any) {
    super(props);

    this.state = {
      refreshing: false,
      loaded: false,
      representatives: [],
      bills: [],
      search: '',
      selectedBill: undefined,
      billMeasure: undefined,
      showDetails: false,
      currentTab: BillTabKey.new,
      detailsExpanded: false,
      currentCard: 0,
      repSelected: false,
      repSelectedInfo: undefined,
      categories: {},
    };

    // create components
    this.AnimatableImage = Animatable.createAnimatableComponent(Image);
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

  // carousel for new tab
  newTab = () => {
    return (
      <Carousel
        data={this.state.bills}
        renderItem={(item: { item: Bill; index: number }) => {
          return (
            <BillSmallCard
              index={item.index}
              item={item.item}
              category={this.state.categories[item.item.category]}
              onPress={(
                item: Bill,
                index: number,
                measure: Measure,
                category: Category
              ) => {
                this.setState({ selectedBill: item });
                this.setState({ billMeasure: measure });
                this.setState({ showDetails: true });
                this.setState({ currentCard: index });
                this.props.toggleTabs();
              }}
            />
          );
        }}
        sliderWidth={width}
        itemWidth={width * 0.8}
        itemHeight={height}
        layout={'default'}
        inactiveSlideScale={0.9}
        inactiveSlideOpacity={0.8}
        centerContent={true}
        loop={false}
        autoplay={true}
        autoplayInterval={10000}
        firstItem={this.state.currentCard}
      />
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
      return this.newTab();
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

  wait = (timeout: number) => {
    return new Promise((resolve) => {
      setTimeout(resolve, timeout);
    });
  };

  mainScreen = () => {
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
        </ScrollView>
      </SafeAreaView>
    );
  };

  billModalScreen = () => {
    return (
      <View
        style={[StyleSheet.absoluteFill, { zIndex: 100 }]}
        pointerEvents={this.state.showDetails ? 'auto' : 'none'}
      >
        <BillDetailScreen
          item={this.state.selectedBill}
          measure={this.state.billMeasure}
          expanded={this.state.showDetails}
          category={
            this.state.categories[this.state.selectedBill?.category || 'DNE']
          }
          onExpanded={() => {
            this.setState({ detailsExpanded: true });
          }}
          onStartClose={() => {
            this.setState({ detailsExpanded: false });
          }}
          onClose={() => {
            this.setState({ showDetails: false });
            this.setState({ selectedBill: undefined });
            this.setState({ billMeasure: undefined });
            this.props.toggleTabs();
          }}
        />
      </View>
    );
  };

  render() {
    if (this.state.loaded) {
      return (
        <View style={styles.container}>
          {!this.state.detailsExpanded && this.mainScreen()}
          {this.billModalScreen()}
        </View>
      );
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
    /*
    shadowColor: 'black',
    shadowRadius: 2.5,
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 0 },*/
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

export default FeedScreen;
