import React, { ReactNode, ReactNodeArray } from 'react';
import {
  Animated,
  Dimensions,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Icon } from 'react-native-elements';
import FastImage from 'react-native-fast-image';
import { colors } from '../../../assets';
import { formatBillNumber } from '../../../models/Bill';
//@ts-ignore
import TouchableScale from 'react-native-touchable-scale';
import { fetchUser, likeBill, storeBillLike } from '../../../util';
import {
  BillDetailInfoScreenRouteProps,
  BillDetailsInfoScreenProps,
} from './BillDetailsStack';
import * as Animatable from 'react-native-animatable';
import { SharedElement } from 'react-navigation-shared-element';
import StickyParallaxHeader from 'react-native-sticky-parallax-header';
import { BlurView } from '@react-native-community/blur';

interface Props {
  navigation: BillDetailsInfoScreenProps;
  route: BillDetailInfoScreenRouteProps;
}

enum ScrollDirection {
  up,
  down,
}

type State = {
  expanded: boolean;
  animation: Animated.Value;
  numberLines: number | undefined;
  liked: boolean;
  transition: Animated.Value;
  transitionComplete: boolean;
  contentRef: React.RefObject<ScrollView>;
  scroll: Animated.Value;
  likeY: number;
  scrollPos: number;
  scrollDirection: ScrollDirection;
  scrollAnimating: boolean;
};

const voteButtonAnimation = {
  0: { scaleX: 1, scaleY: 1, transform: [{ rotate: '0deg' }] },
  0.1: {
    scaleX: 0.85,
    scaleY: 0.85,
    transform: [{ rotate: '-7deg' }],
  },
  0.2: {
    scaleX: 0.85,
    scaleY: 0.85,
    transform: [{ rotate: '-7deg' }],
  },
  0.3: {
    scaleX: 1.3,
    scaleY: 1.3,
    transform: [{ rotate: '-7deg' }],
  },
  0.4: {
    transform: [{ rotate: '7deg' }],
  },
  0.5: {
    transform: [{ rotate: '-7deg' }],
  },
  0.6: {
    transform: [{ rotate: '7deg' }],
  },
  0.7: {
    transform: [{ rotate: '-7deg' }],
  },
  0.8: {
    transform: [{ rotate: '7deg' }],
  },
  0.9: {
    scaleX: 1.3,
    scaleY: 1.3,
    transform: [{ rotate: '7deg' }],
  },
  1: {
    scaleX: 1,
    scaleY: 1,
    transform: [{ rotate: '0deg' }],
  },
};

const AnimatedSharedElement = Animated.createAnimatedComponent(SharedElement);
const AnimatedFastImage = Animated.createAnimatedComponent(FastImage);
const { height } = Dimensions.get('screen');

export default class BillInfoScreen extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      expanded: false,
      animation: new Animated.Value(0),
      numberLines: 5,
      liked: false,
      transition: new Animated.Value(0),
      transitionComplete: true,
      contentRef: React.createRef<ScrollView>(),
      likeY: 220,
      scroll: new Animated.Value(0),
      scrollPos: 0,
      scrollDirection: ScrollDirection.down,
      scrollAnimating: false,
    };

    fetchUser().then((user) => {
      if (user.liked[props.route.params.bill.number]) {
        this.setState({ liked: true });
      }
    });
  }
  componentDidMount() {
    this.props.navigation.addListener('transitionStart', (e) => {
      if (e.data.closing) {
        Animated.timing(this.state.transition, {
          toValue: 1,
          useNativeDriver: false,
          duration: 300,
        }).start();
      } else {
        Animated.timing(this.state.transition, {
          toValue: 1,
          useNativeDriver: false,
          duration: 3000,
        }).start(() => {
          this.setState({ transitionComplete: true });
        });
      }
    });
  }

  render() {
    const { bill, category } = this.props.route.params;

    const renderForeground = () => {
      return (
        <View>
          <AnimatedSharedElement
            id={`bill.${bill.number}.photo`}
            style={[
              styles.imageContainer,
              {
                minHeight: 0.125 * height,
                maxHeight: 0.35 * height,
                height: 0.3 * height,
                zIndex: 100,
                transform: [
                  {
                    scale: this.state.scroll.interpolate({
                      inputRange: [
                        -0.3 * height,
                        -0.2 * height,
                        0,
                        0.3 * height,
                      ],
                      outputRange: [1.2, 1.2, 1, 1],
                    }),
                  },
                  {
                    translateY: this.state.scroll.interpolate({
                      inputRange: [-1, 0, 1],
                      outputRange: [-0.5, 0, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <AnimatedFastImage
              resizeMode="cover"
              style={[
                styles.image,
                {
                  transform: [
                    {
                      translateY: this.state.scroll.interpolate({
                        inputRange: [0, 0.3 * height],
                        outputRange: [0, 0.1 * height],
                      }),
                    },
                  ],
                },
              ]}
              source={{ uri: category.image }}
            />
          </AnimatedSharedElement>
          <Animated.View
            style={{
              marginHorizontal: '7.5%',
              marginTop: '3.5%',
              transform: [
                {
                  translateY: this.state.scroll.interpolate({
                    inputRange: [-1, 0, 0.3 * height],
                    outputRange: [0, 0, -0.1 * height],
                  }),
                },
              ],
            }}
          >
            <View style={styles.categoriesContainer}>
              <Text style={styles.number}>{formatBillNumber(bill)}</Text>
              <SharedElement
                id={`bill.${bill.number}.category`}
                style={[
                  styles.category,
                  { backgroundColor: category.categoryColor },
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    { color: category.categoryTextColor },
                  ]}
                >
                  {bill.category}
                </Text>
              </SharedElement>
            </View>
            <Text style={styles.title}>{bill.title}</Text>
          </Animated.View>
        </View>
      );
    };
    const renderHeader = () => {
      return (
        <Animated.View
          style={[
            {
              position: 'absolute',
              width: '100%',
              height: 0.125 * height,
              zIndex: 100,
            },
            {
              opacity: this.state.scroll.interpolate({
                inputRange: [0, 0.15 * height, 0.25 * height],
                outputRange: [0, 0, 1],
                extrapolate: 'clamp',
              }),
            },
          ]}
        >
          <BlurView
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            blurType="ultraThinMaterial"
            blurAmount={5}
          >
            <Text
              style={{
                color: 'white',
                fontWeight: 'bold',
                fontFamily: 'Futura',
                marginHorizontal: '20%',
                marginTop: '10%',
                fontSize: 16,
                textAlign: 'center',
              }}
              numberOfLines={2}
              adjustsFontSizeToFit={true}
            >
              {bill.title}
            </Text>
          </BlurView>
        </Animated.View>
      );
    };
    const renderBody = () => {
      return (
        <View style={[styles.content]}>
          <Text ellipsizeMode="tail" style={styles.synopsis}>
            {bill.short_summary + bill.full_summary}
          </Text>
        </View>
      );
    };
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: 'white',
        }}
      >
        {renderHeader()}
        <Animated.ScrollView
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: this.state.scroll } } }],
            {
              useNativeDriver: true,
              listener: (e) => {
                //@ts-ignore
                let newPos = e.nativeEvent.contentOffset.y;
                this.setState({
                  scrollDirection:
                    newPos - this.state.scrollPos > 0
                      ? ScrollDirection.down
                      : ScrollDirection.up,
                });
                this.setState({ scrollPos: newPos });
              },
            }
          )}
          ref={this.state.contentRef}
          onScrollBeginDrag={() => {
            this.setState({ scrollAnimating: false });
          }}
          onMomentumScrollEnd={(e: any) => {
            if (!this.state.scrollAnimating) {
              let y = e.nativeEvent.contentOffset.y;
              let isDown = this.state.scrollDirection == ScrollDirection.down;
              if (y > 0.05 * height && y < 0.3 * height && isDown) {
                this.state.contentRef.current?.scrollTo({ y: 0.275 * height });
                this.setState({ scrollAnimating: true });
              } else if (y <= 0.05 * height && isDown) {
                this.state.contentRef.current?.scrollTo({ y: 0 });
                this.setState({ scrollAnimating: true });
              } else if (y <= 0.35 * height && !isDown) {
                this.state.contentRef.current?.scrollTo({ y: 0 });
                this.setState({ scrollAnimating: true });
              } else {
                this.state.contentRef.current?.scrollTo({ y: y });
              }
            }
          }}
          onScrollEndDrag={(e: any) => {
            if (!this.state.scrollAnimating) {
              let y = e.nativeEvent.contentOffset.y;
              let isDown = this.state.scrollDirection == ScrollDirection.down;
              if (y > 0.05 * height && y < 0.3 * height && isDown) {
                this.state.contentRef.current?.scrollTo({ y: 0.275 * height });
                this.setState({ scrollAnimating: true });
              } else if (y <= 0.05 * height && isDown) {
                this.state.contentRef.current?.scrollTo({ y: 0 });
                this.setState({ scrollAnimating: true });
              } else if (y <= 0.35 * height && !isDown) {
                this.state.contentRef.current?.scrollTo({ y: 0 });
                this.setState({ scrollAnimating: true });
              }
            }
          }}
          overScrollMode="never"
          scrollToOverflowEnabled={true}
        >
          {renderForeground()}
          {renderBody()}
        </Animated.ScrollView>
        {this.closeButton()}
        {this.likeButton()}
        {this.footer()}
      </View>
    );
  }

  footer = () => {
    const { height } = Dimensions.get('screen');
    return (
      <View
        style={{
          height: height * 0.07,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-start',
          marginBottom: '7%',
          marginHorizontal: '7.5%',
          backgroundColor: 'transparent',
        }}
      >
        <View style={styles.fullBill}>
          <TouchableOpacity
            style={{
              flex: 1,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
            }}
            onPress={() => {
              Linking.canOpenURL(this.props.route.params.bill.url).then(
                (supported) => {
                  if (supported) {
                    Linking.openURL(this.props.route.params.bill.url);
                  }
                }
              );
            }}
          >
            <Icon
              type="feather"
              name="external-link"
              size={24}
              color="#0091ea"
            />
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                fontFamily: 'Futura',
                marginLeft: '10%',
              }}
            >
              See full bill page
            </Text>
          </TouchableOpacity>
        </View>
        <Animatable.View
          animation={voteButtonAnimation}
          iterationCount={'infinite'}
          duration={2000}
          iterationDelay={3000}
          style={styles.voteButton}
        >
          <TouchableScale
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={() => {
              // @ts-ignore
              this.props.navigation.push('Vote', this.props.route.params);
            }}
          >
            <Icon
              type="material-community"
              name="vote-outline"
              size={30}
              color="white"
            />
          </TouchableScale>
        </Animatable.View>
      </View>
    );
  };

  likeButton = () => {
    return (
      <Animated.View
        style={{
          position: 'absolute',
          width: 40,
          height: 40,
          top: '23%',
          right: '6%',
          zIndex: 100,
          transform: [
            {
              translateY: this.state.scroll.interpolate({
                inputRange: [-1, 0, height * 0.25, height * 0.3],
                outputRange: [0, 0, -0.17 * height, -0.17 * height],
              }),
            },
          ],
        }}
      >
        <Animatable.View animation={'fadeIn'} style={[styles.likeButton]}>
          <TouchableOpacity
            style={{ width: '100%', height: '100%' }}
            onPress={() => {
              likeBill(this.props.route.params.bill, !this.state.liked);
              storeBillLike(this.props.route.params.bill, !this.state.liked);
              this.setState({ liked: !this.state.liked });
            }}
          >
            <Animatable.View
              animation={this.state.liked ? 'pulse' : undefined}
              iterationCount="infinite"
              style={{
                width: '100%',
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Icon
                size={26}
                name={this.state.liked ? 'heart-sharp' : 'heart-outline'}
                type="ionicon"
                color={this.state.liked ? colors.republican : 'black'}
              />
            </Animatable.View>
          </TouchableOpacity>
        </Animatable.View>
      </Animated.View>
    );
  };

  // generate the close button
  closeButton = () => {
    return (
      <Animatable.View style={styles.closeButton} animation="fadeIn">
        <TouchableOpacity
          style={{
            width: '100%',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => {
            this.props.navigation.goBack();
          }}
        >
          <Icon size={26} name="arrow-left" type="feather" color="black" />
        </TouchableOpacity>
      </Animatable.View>
    );
  };
}

const styles = StyleSheet.create({
  container: {
    width: '78.2%',
    height: '46%',
    marginTop: '89%',
    alignSelf: 'center',
    borderRadius: 40,
    backgroundColor: 'white',
  },

  imageContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'black',
    shadowOpacity: 0.5,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 2.5 },
  },
  image: {
    width: '100%',
    height: '100%',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    flex: 1,
  },
  content: {
    borderRadius: 20,
    marginTop: '2.5%',
    marginBottom: '10%',
    paddingHorizontal: '7.5%',
    zIndex: 0,
  },
  number: {
    fontFamily: 'Roboto-Light',
    fontWeight: '400',
    fontSize: 16,
    color: colors.blueGray,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Futura',
    fontWeight: '700',
    marginTop: '1%',
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
    fontWeight: '400',
    fontFamily: 'Futura',
    textAlign: 'justify',
  },
  closeButton: {
    position: 'absolute',
    width: 40,
    height: 40,
    left: '6%',
    top: '6%',
    zIndex: 100,
    backgroundColor: 'white',
    borderRadius: 12.5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'black',
    shadowRadius: 5,
    shadowOpacity: 0.45,
    shadowOffset: { width: 0, height: 1 },
  },
  likeButton: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 12.5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'black',
    shadowRadius: 5,
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 1 },
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
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: colors.votingBackgroundColor,
    shadowColor: 'black',
    shadowOpacity: 0.25,
    shadowRadius: 30,
    zIndex: 150,
    flex: 1,
  },
  fullBill: {
    padding: '4%',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: 'white',
    shadowColor: 'black',
    shadowOpacity: 0.25,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 1 },
    zIndex: 150,
    flex: 4,
    marginRight: '5%',
  },
  voteText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
});
