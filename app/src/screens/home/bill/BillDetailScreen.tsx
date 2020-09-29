import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { colors } from '../../../assets';
import { Image } from 'react-native-animatable';
import BillItem from './components/BillItem';
import { SharedElement } from 'react-navigation-shared-element';
import { Icon } from 'react-native-elements';
import BillFloatingTabs, {
  BillFloatingTabKey,
} from '../../../components/BillFloatingTabs';
import TouchableScale from 'react-native-touchable-scale';
import { SafeAreaView } from 'react-native-safe-area-context';
import CommentItem from './components/CommentItem';

export type Measure = {
  x: number;
  y: number;
  width: number;
  height: number;
};
type Props = {
  item: BillItem | undefined;
  measure: Measure | undefined;
  expanded: boolean;
  onClose: () => void;
  onStartClose: () => void;
  onExpanded: () => void;
};
type State = {
  expanded: boolean;
  animation: Animated.Value;
  numberLines: number | undefined;
  activeTab: string;
  showTabBar: boolean;
};

const width = Dimensions.get('screen').width;
const height = Dimensions.get('screen').height;

class BillDetailScreen extends React.Component<Props, State> {
  screenWidth: Animated.AnimatedInterpolation;
  screenHeight: Animated.AnimatedInterpolation;
  screenMarginTop: Animated.AnimatedInterpolation;
  textOpacity: Animated.AnimatedInterpolation;
  contentMargin: Animated.AnimatedInterpolation;
  tabBarHeight: Animated.AnimatedInterpolation;
  tabBarOpacity: Animated.AnimatedInterpolation;
  borderRadius: Animated.AnimatedInterpolation;

  AnimatedTouchableScale: Animated.AnimatedComponent<TouchableScale>;

  constructor(props: Props) {
    super(props);

    this.state = {
      expanded: false,
      animation: new Animated.Value(0),
      numberLines: 5,
      activeTab: BillFloatingTabKey.info,
      showTabBar: false,
    };

    this.screenWidth = this.state.animation.interpolate({
      inputRange: [0, 1],
      // outputRange: ['78.2%', '100%'],
      outputRange: [this.props.measure?.width || 0, width],
    });
    this.screenHeight = this.state.animation.interpolate({
      inputRange: [0, 1],
      //outputRange: ['46%', '100%'],
      outputRange: [this.props.measure?.height || 0, height],
    });
    this.screenMarginTop = this.state.animation.interpolate({
      inputRange: [0, 1],
      //outputRange: ['89%', '0%'],
      outputRange: [this.props.measure?.y || 0, 0],
    });
    this.textOpacity = this.state.animation.interpolate({
      inputRange: [0, 0.1, 0.9, 1],
      outputRange: [1, 0, 0, 1],
    });
    this.contentMargin = this.state.animation.interpolate({
      inputRange: [0, 1],
      outputRange: ['5%', '0%'],
    });
    this.tabBarHeight = this.state.animation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '8%'],
    });
    this.tabBarOpacity = this.state.animation.interpolate({
      inputRange: [0, 0.25],
      outputRange: [0, 1],
    });

    this.borderRadius = this.state.animation.interpolate({
      inputRange: [0, 1],
      outputRange: [40, 0],
    });

    // generate animated components
    this.AnimatedTouchableScale = Animated.createAnimatedComponent(
      TouchableScale
    );
  }

  // expand the card outward
  expand = () => {
    this.setState({ showTabBar: true });

    Animated.timing(this.state.animation, {
      toValue: 1,
      useNativeDriver: false,
      duration: 250,
    }).start(() => {
      this.props.onExpanded();
      this.setState({ expanded: true });
    });
    this.setState({ numberLines: undefined });
  };

  // collapse the card
  collapse = () => {
    this.setState({ numberLines: 5 });
    this.setState({ showTabBar: false });
    this.onTabPress(BillFloatingTabKey.info);
    this.props.onStartClose();

    Animated.timing(this.state.animation, {
      toValue: 0,
      useNativeDriver: false,
      duration: 250,
    }).start(() => {
      this.props.onClose();
      this.setState({ expanded: false });
    });
  };

  // generate information page
  infoPage = (item: BillItem) => {
    return (
      <View style={{ flex: 1 }}>
        <Animated.View
          style={[styles.voteButton, { opacity: this.state.animation }]}
        >
          <TouchableScale
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
            onPress={() => {
              this.setState({ activeTab: BillFloatingTabKey.voting });
            }}
          >
            <Text style={styles.voteText}>Vote!</Text>
          </TouchableScale>
        </Animated.View>
        <Animated.View
          style={[
            styles.imageContainer,
            {
              borderTopLeftRadius: this.borderRadius,
              borderTopRightRadius: this.borderRadius,
            },
          ]}
        >
          <Image style={styles.image} source={item.image} />
        </Animated.View>
        <Animated.View
          style={[
            styles.content,
            {
              margin: this.contentMargin,
              borderBottomRightRadius: this.borderRadius,
              borderBottomLeftRadius: this.borderRadius,
            },
          ]}
        >
          <View style={styles.categoriesContainer}>
            <Text style={styles.number}>{item.id}</Text>
            <View
              style={[styles.category, { backgroundColor: item.categoryColor }]}
            >
              <Text
                style={[styles.categoryText, { color: item.categoryTextColor }]}
              >
                {item.category}
              </Text>
            </View>
          </View>
          <Text style={styles.title}>{item.title}</Text>
          <ScrollView>
            <Text ellipsizeMode="tail" style={styles.synopsis}>
              {item.description}
            </Text>
          </ScrollView>
        </Animated.View>
      </View>
    );
  };

  // generate voting page
  votingPage = () => {
    return (
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <SafeAreaView />
        <Text
          style={{
            alignSelf: 'center',
            marginTop: '5%',
            fontSize: 30,
            fontWeight: 'bold',
          }}
        >
          Vote
        </Text>
        <Text
          style={{
            alignSelf: 'center',
            marginTop: '15%',
            fontSize: 24,
            fontWeight: 'bold',
          }}
        >
          Do you support this bill?
        </Text>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignSelf: 'center',
            marginTop: '5%',
          }}
        >
          <TouchableOpacity
            style={{
              width: 100,
              height: 50,
              justifyContent: 'center',
              alignItems: 'center',
              padding: '2.5%',
              backgroundColor: '#1de9b6',
              borderRadius: 10,
              marginHorizontal: '5%',
            }}
          >
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white' }}>
              Yes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              width: 100,
              height: 50,
              justifyContent: 'center',
              alignItems: 'center',
              padding: '2.5%',
              backgroundColor: '#ff5252',
              marginHorizontal: '5%',
              borderRadius: 10,
            }}
          >
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white' }}>
              No
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ flex: 1, marginTop: '5%', marginHorizontal: '5%' }}>
          <CommentItem
            image="https://ilga.gov/images/members/%7B370B1494-7F8F-48BC-BD66-4756E15442E1%7D.jpg"
            comment="Telehealth is especially necessary during the pandemic when doctors don't have access to their parents. "
            name="Representative Edgar Gonzales"
          />
          <CommentItem
            image="https://scontent-ort2-2.xx.fbcdn.net/v/t1.0-9/101002973_2570520339867071_1869691803314159616_n.jpg?_nc_cat=100&_nc_sid=85a577&_nc_ohc=U_JsmQ5C9DYAX8pbCnh&_nc_ht=scontent-ort2-2.xx&oh=84bbd17915f6b271f57ca236f66589af&oe=5F4238F5"
            comment="Doesn't this set a poor prescendent for people not going to their doctors? And rather defaulting to telehealth services"
            name="Pranav Putta"
            indent={1}
          />
          <CommentItem
            image="https://ilga.gov/images/members/%7B370B1494-7F8F-48BC-BD66-4756E15442E1%7D.jpg"
            comment="Actually, I think this is an extremely benefitial precedent to set because it allows us to make an industry wide standard that we want to encourage pepole who don't generally have immediate access to healthcare to be able to fully take advantage of telehealth services!"
            name="Representative Edgar Gonzales"
            indent={1}
          />
          <CommentItem
            image="https://scontent-ort2-2.xx.fbcdn.net/v/t1.0-9/101002973_2570520339867071_1869691803314159616_n.jpg?_nc_cat=100&_nc_sid=85a577&_nc_ohc=U_JsmQ5C9DYAX8pbCnh&_nc_ht=scontent-ort2-2.xx&oh=84bbd17915f6b271f57ca236f66589af&oe=5F4238F5"
            comment="Thank you so much for the feedback!"
            name="Pranav Putta"
            indent={1}
          />
          <CommentItem
            image="https://ilga.gov/images/members/%7B370B1494-7F8F-48BC-BD66-4756E15442E1%7D.jpg"
            comment="Glad to be of assistance!"
            name="Edgar Gonzales"
            indent={1}
          />
        </View>
      </View>
    );
  };

  // generate research page
  researchPage = () => {
    return <View></View>;
  };

  // generate current tab from state
  currentTabPage = (item: BillItem) => {
    switch (this.state.activeTab) {
      case BillFloatingTabKey.info: {
        return this.infoPage(item);
      }
      case BillFloatingTabKey.voting: {
        return this.votingPage();
      }
      case BillFloatingTabKey.research: {
        return this.researchPage();
      }
    }
  };

  // called when tab { 'info', 'voting', 'research' } is clicked
  onTabPress = (key: string) => {
    this.setState({ activeTab: key });
  };

  // generate the close button
  backButton = () => {
    return (
      <Animated.View
        style={[styles.backButton, { opacity: this.state.animation }]}
      >
        <TouchableOpacity
          style={styles.backButtonTouchable}
          onPress={() => {
            this.collapse();
          }}
        >
          <Icon size={26} name="close" type="evilicon" color="black" />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  render() {
    if (this.props.item != undefined && this.props.measure != undefined) {
      this.screenWidth = this.state.animation.interpolate({
        inputRange: [0, 1],
        // outputRange: ['78.2%', '100%'],
        outputRange: [this.props.measure?.width || 0, width],
      });
      this.screenHeight = this.state.animation.interpolate({
        inputRange: [0, 1],
        //outputRange: ['46%', '100%'],
        outputRange: [this.props.measure?.height || 0, height],
      });
      this.screenMarginTop = this.state.animation.interpolate({
        inputRange: [0, 1],
        //outputRange: ['89%', '0%'],
        outputRange: [this.props.measure?.y || 0, 0],
      });

      if (!this.state.expanded && this.props.expanded) {
        this.expand();
      }
      return (
        <Animated.View
          style={[
            styles.container,
            {
              backgroundColor: this.props.item.bgColor,
              width: this.screenWidth,
              height: this.screenHeight,
              marginTop: this.screenMarginTop,
              borderRadius: this.borderRadius,
            },
          ]}
        >
          {Platform.select({
            ios: <StatusBar barStyle="light-content" />,
          })}

          {this.currentTabPage(this.props.item)}
          {this.backButton()}
          <BillFloatingTabs
            current={this.state.activeTab}
            height={this.tabBarHeight}
            opacity={this.tabBarOpacity}
            itemColor={this.props.item.categoryColor}
            itemTextColor={this.props.item.categoryTextColor}
            onTabPress={this.onTabPress}
          />
        </Animated.View>
      );
    } else {
      return <View></View>;
    }
  }
}
const styles = StyleSheet.create({
  container: {
    width: '78.2%',
    height: '46%',
    marginTop: '89%',
    alignSelf: 'center',
    borderRadius: 40,
    backgroundColor: colors.cards.temp,
  },

  imageContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  image: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  content: {
    backgroundColor: 'white',
    borderRadius: 30,
    paddingVertical: '5%',
    paddingBottom: '2%',
    paddingHorizontal: '7.5%',
    flex: 2,
    shadowColor: 'black',
    shadowOpacity: 0.5,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 2.5 },
  },
  number: {
    fontFamily: 'Roboto-Light',
    fontWeight: '400',
    fontSize: 16,
    color: colors.blueGray,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Futura-CondensedLight',
    fontWeight: '700',
    marginTop: '5%',
  },
  categoriesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  category: {
    backgroundColor: colors.finishButtonIconColor,
    justifyContent: 'center',
    alignItems: 'center',
    padding: '2%',
    paddingHorizontal: '4%',
    borderRadius: 20,
  },
  categoryText: { color: 'white', fontWeight: 'bold' },
  header: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: '10%',
  },
  synopsis: {
    flex: 1,
    flexWrap: 'wrap',
    textAlignVertical: 'center',
    marginTop: '5%',
    fontSize: 15,
    fontWeight: '200',
    fontFamily: 'Futura',
  },
  backButton: {
    position: 'absolute',
    width: 40,
    height: 40,
    right: '6%',
    top: '6%',
  },
  backButtonTouchable: {
    backgroundColor: colors.textInputBackground,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  voteButton: {
    position: 'absolute',
    right: '7%',
    bottom: '3%',
    padding: '4%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: colors.votingBackgroundColor,
    shadowColor: 'black',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    zIndex: 150,
  },
  voteText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default BillDetailScreen;
