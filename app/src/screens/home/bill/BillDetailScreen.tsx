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
import { TextInput } from 'react-native-gesture-handler';

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
enum Vote {
  Yes,
  No,
  None,
}
type State = {
  expanded: boolean;
  animation: Animated.Value;
  numberLines: number | undefined;
  activeTab: string;
  showTabBar: boolean;
  vote: Vote;
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

  yayAnimation: Animated.Value;
  noAnimation: Animated.Value;

  AnimatedTouchableScale: Animated.AnimatedComponent<TouchableScale>;

  constructor(props: Props) {
    super(props);

    this.state = {
      expanded: false,
      animation: new Animated.Value(0),
      numberLines: 5,
      // TODO: change
      activeTab: BillFloatingTabKey.voting,
      showTabBar: false,
      vote: Vote.None,
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

    this.yayAnimation = new Animated.Value(0);
    this.noAnimation = new Animated.Value(0);

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
        {this.closeButton()}
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

  comment = () => {
    return (
      <View
        style={{
          borderRadius: 10,
          marginTop: '2.5%',
          padding: '5%',
          paddingBottom: '2.5%',
          borderWidth: 1,
          borderColor: colors.textInputBackground,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Image
            style={{ width: 40, height: 40, borderRadius: 40 }}
            source={{
              uri:
                'https://ilhousedems.com/wp-content/uploads/2020/02/Gonzalez.jpg',
            }}
          />
          <View
            style={{ marginHorizontal: 10, justifyContent: 'space-between' }}
          >
            <Text style={{ fontWeight: 'bold' }}>Edgar Gonzales</Text>
            <Text>September 4, 2020</Text>
          </View>
          <View
            style={{
              backgroundColor: '#ff5252',
              margin: '2.5%',
              position: 'absolute',
              justifyContent: 'center',
              alignItems: 'center',
              right: 0,
              borderRadius: 5,
            }}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Against</Text>
          </View>
        </View>
        <Text style={{ padding: '2.5%' }}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla
          ultricies lorem ac pellentesque dignissim.
        </Text>
        <View>
          <TouchableOpacity
            style={{
              marginHorizontal: '2.5%',
              width: 50,
              padding: 5,
              //backgroundColor: '#cfd8dc',
              borderRadius: 5,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Icon name="like2" type="antdesign" size={18} color="black" />
            <Text>10</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // generate voting page
  votingPage = () => {
    const AnimatedTouchableOpacity = Animated.createAnimatedComponent(
      TouchableOpacity
    );

    const animateVoting = (vote: Vote) => {
      const current = this.state.vote;
      const anim = vote == Vote.Yes ? this.yayAnimation : this.noAnimation;
      if (current == vote) {
        Animated.timing(anim, {
          toValue: 0,
          useNativeDriver: false,
          duration: 250,
        }).start();
        this.setState({ vote: Vote.None });
      } else if (current != vote) {
        let yes = 1;
        let no = 0;
        if (vote == Vote.No) {
          yes = 0;
          no = 1;
        }
        Animated.parallel([
          Animated.timing(this.yayAnimation, {
            toValue: yes,
            useNativeDriver: false,
            duration: 250,
          }),
          Animated.timing(this.noAnimation, {
            toValue: no,
            useNativeDriver: false,
            duration: 250,
          }),
        ]).start();
        this.setState({ vote: vote });
      } else if (current == Vote.None) {
        Animated.timing(anim, {
          toValue: 1,
          useNativeDriver: false,
          duration: 250,
        }).start();
        this.setState({ vote: vote });
      }
    };
    return (
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <SafeAreaView />
        <View style={{ flexDirection: 'row' }}>
          <Animated.View
            style={[styles.backButton, { opacity: this.state.animation }]}
          >
            <TouchableOpacity
              style={styles.backButtonTouchable}
              onPress={() => {
                this.setState({ activeTab: BillFloatingTabKey.info });
              }}
            >
              <Icon size={26} name="arrow-left" type="feather" color="black" />
            </TouchableOpacity>
          </Animated.View>

          <Text
            style={{
              alignSelf: 'center',
              fontSize: 30,
              fontWeight: 'bold',
            }}
          >
            Vote
          </Text>
        </View>

        <View
          style={{ marginHorizontal: '10%', marginTop: '5%', height: '72.5%' }}
        >
          <View
            style={{
              flexDirection: 'row',
              borderRadius: 10,
            }}
          >
            <AnimatedTouchableOpacity
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                padding: '10%',
                backgroundColor: this.yayAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [colors.textInputBackground, '#00e676'],
                }),
                borderTopLeftRadius: 10,
                borderBottomLeftRadius: 10,
              }}
              onPress={() => {
                animateVoting(Vote.Yes);
              }}
            >
              <Animated.Text
                style={{
                  fontSize: 25,
                  fontWeight: 'bold',
                  color: this.yayAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['black', 'white'],
                  }),
                }}
              >
                Yes
              </Animated.Text>
            </AnimatedTouchableOpacity>
            <View
              style={{
                height: '100%',
                width: 0.5,
              }}
            />
            <AnimatedTouchableOpacity
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                padding: '10%',
                backgroundColor: this.noAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [colors.textInputBackground, '#ff5252'],
                }),
                borderTopRightRadius: 10,
                borderBottomRightRadius: 10,
              }}
              onPress={() => {
                animateVoting(Vote.No);
              }}
            >
              <Animated.Text
                style={{
                  fontSize: 25,
                  fontWeight: 'bold',
                  color: this.noAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['black', 'white'],
                  }),
                }}
              >
                No
              </Animated.Text>
            </AnimatedTouchableOpacity>
          </View>
          <Text style={{ marginTop: '5%', fontSize: 20, fontWeight: 'bold' }}>
            Comments
          </Text>
          <ScrollView>
            {this.comment()}
            {this.comment()}
          </ScrollView>
        </View>
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            height: '12%',
            backgroundColor: '#546e7a',
            borderTopLeftRadius: 25,
            borderTopRightRadius: 25,
            padding: '5%',
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <TextInput
            placeholder="Write your opinion"
            placeholderTextColor="#e0e0e0"
            style={{ fontSize: 20, color: colors.textInputBackground }}
          />
          <TouchableOpacity
            style={{
              backgroundColor: '#2196f3',
              padding: 7.5,
              borderRadius: 30,
            }}
          >
            <Icon
              size={30}
              name="arrow-right"
              style={{ fontWeight: 'bold' }}
              type="feather"
              color="white"
            />
          </TouchableOpacity>
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
    }
  };

  // called when tab { 'info', 'voting', 'research' } is clicked
  onTabPress = (key: string) => {
    this.setState({ activeTab: key });
  };

  // generate the close button
  closeButton = () => {
    return (
      <Animated.View
        style={[styles.closeButton, { opacity: this.state.animation }]}
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

  backButton = () => {
    return (
      <Animated.View
        style={[styles.backButton, { opacity: this.state.animation }]}
      >
        <TouchableOpacity
          style={styles.backButtonTouchable}
          onPress={() => {
            this.setState({ activeTab: BillFloatingTabKey.info });
          }}
        >
          <Icon size={26} name="arrow-left" type="feather" color="black" />
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
    borderRadius: 20,
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
  closeButton: {
    position: 'absolute',
    width: 40,
    height: 40,
    right: '6%',
    top: '6%',
    zIndex: 100,
    backgroundColor: colors.textInputBackground,
    borderRadius: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    marginHorizontal: 20,
  },
  backButtonTouchable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
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
