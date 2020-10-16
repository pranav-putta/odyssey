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
import { Bill } from '../../../models/Bill';
import { Category } from '../../../models/Category';
import { NavigationContainer } from '@react-navigation/native';
import {
  createStackNavigator,
  StackNavigationOptions,
} from '@react-navigation/stack';
import routes from '../../../routes/routes';
import BillInfoScreen from './info/BillInfoScreen';
import BillVotingScreen from './vote/BillVotingScreen';

export type Measure = {
  x: number;
  y: number;
  width: number;
  height: number;
};
type Props = {
  item: Bill;
  category: Category;
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

type ScreenOptions = {
  infoOptions: StackNavigationOptions;
  votingOptions: StackNavigationOptions;
};

const options: ScreenOptions = {
  infoOptions: {
    header: undefined,
    headerShown: false,
    gestureEnabled: true,
  },
  votingOptions: {
    header: undefined,
    headerShown: false,
    gestureEnabled: true,
  },
};

const Stack = createStackNavigator();

const width = Dimensions.get('screen').width;
const height = Dimensions.get('screen').height;

class BillDetailScreen extends React.Component<Props, State> {
  screenWidth: Animated.AnimatedInterpolation;
  screenHeight: Animated.AnimatedInterpolation;
  screenMarginTop: Animated.AnimatedInterpolation;
  textOpacity: Animated.AnimatedInterpolation;
  contentMargin: Animated.AnimatedInterpolation;
  borderRadius: Animated.AnimatedInterpolation;

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
          <Stack.Navigator>
            <Stack.Screen name={routes.billInfo} options={options.infoOptions}>
              {(props) => (
                <BillInfoScreen
                  {...props}
                  borderRadius={this.borderRadius}
                  category={this.props.category}
                  item={this.props.item}
                  collapse={this.collapse}
                  contentMargin={this.contentMargin}
                />
              )}
            </Stack.Screen>
            <Stack.Screen
              name={routes.billVoting}
              component={BillVotingScreen}
              options={options.votingOptions}
            />
          </Stack.Navigator>
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
