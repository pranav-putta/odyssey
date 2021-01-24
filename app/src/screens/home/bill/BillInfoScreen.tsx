import React, { ReactNode, ReactNodeArray } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  View,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Icon } from 'react-native-elements';
import FastImage from 'react-native-fast-image';
import { colors } from '../../../assets';
import {
  Bill,
  BillActionTag,
  BillHandler,
  BillMetadata,
  BillVotingEvent,
  formatBillNumber,
} from '../../../models/Bill';
//@ts-ignore
import TouchableScale from 'react-native-touchable-scale';
import { Network } from '../../../util';
import { BillDetailsInfoScreenProps } from './BillDetailsStack';
import * as Animatable from 'react-native-animatable';
import { SharedElement } from 'react-navigation-shared-element';
import { BlurView } from '@react-native-community/blur';
import { Category, DefaultCategory } from '../../../models/Category';
import { Config } from '../../../util/Config';
import { Analytics } from '../../../util/services/AnalyticsHandler';
import inappmessaging from '@react-native-firebase/in-app-messaging';
import { Browser } from '../../../util/Browser';
import { User, UserHandler } from '../../../redux/models/user';
import store from '../../../redux/store';
import BillProgressBar from '../../../components/BillProgressBar';
import { StorageService } from '../../../redux/storage';
import { connect } from 'react-redux';
import {
  UIScreenCode,
  UIStatus,
  UIStatusCode,
} from '../../../redux/ui/ui.types';
import { voteButtonAnimation } from '../../../components/Animations';
import tinycolor from 'tinycolor2';
import Skeleton, { Skeletons } from '../../../components/Skeleton';
import { Odyssey } from '../../Navigator';
import { UIService } from '../../../redux/ui/ui';
import Space from '../../../components/Space';
import { Representative } from '../../../models';
// @ts-ignore
import Slider from 'react-native-slider';
import RaisedButton from '../../login/components/RaisedButton';
import Button from '../../../components/Button';
import { BillData, Comment } from '../../../models/BillData';

interface Props {
  bill?: Bill;
  user: User;
  navigation: BillDetailsInfoScreenProps;
  category: Category;
  blurType: 'light' | 'ultraThinMaterial';
  error?: string;
}

enum ScrollDirection {
  up,
  down,
}

type State = {
  expanded: boolean;
  animation: Animated.Value;
  numberLines: number | undefined;
  transition: Animated.Value;
  transitionComplete: boolean;
  contentRef: React.RefObject<ScrollView>;
  scroll: Animated.Value;
  likeY: number;
  scrollPos: number;
  scrollDirection: ScrollDirection;
  scrollAnimating: boolean;
};

const AnimatedSharedElement = Animated.createAnimatedComponent(SharedElement);
const AnimatedFastImage = Animated.createAnimatedComponent(FastImage);
const { height } = Dimensions.get('screen');

const coverHeight = 0.325 * height;
const minimizedCoverHeight = 0.125 * height;

function mapStoreToProps() {
  let { ui, storage } = store.getState();
  let user = storage.user;

  let b = ui.screen.code == UIScreenCode.bill ? ui.screen.bill : undefined;
  let data =
    ui.screen.code == UIScreenCode.bill ? ui.screen.billData : undefined;

  // set up category and blur type
  let category = DefaultCategory;
  if (b) {
    category = Config.getTopics()[b.category];
    if (!category) {
      category = DefaultCategory;

      Config.alertUpdateConfig().then(() => {
        store.dispatch(
          UIService.setError('Something went wrong! Try reloading the app')
        );
      });
    }
  }
  let isDark = tinycolor(category.bgColor).isDark();
  let blurType: 'light' | 'ultraThinMaterial' = isDark
    ? 'light'
    : 'ultraThinMaterial';
  return {
    user,
    bill: b,
    category,
    blurType,
    error: ui.status.code == UIStatusCode.error ? ui.status.message : undefined,
  };
}

class BillInfoScreen extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      expanded: false,
      animation: new Animated.Value(0),
      numberLines: 5,
      transition: new Animated.Value(0),
      transitionComplete: true,
      contentRef: React.createRef<ScrollView>(),
      likeY: 220,
      scroll: new Animated.Value(0),
      scrollPos: 0,
      scrollDirection: ScrollDirection.down,
      scrollAnimating: false,
    };
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

  componentDidUpdate() {
    if (this.props.error) {
      Alert.alert('Error', this.props.error);
      store.dispatch(UIService.setStableState());
    }
  }

  render() {
    const { bill, category } = this.props;

    if (bill) {
      return (
        <View
          style={{
            flex: 1,
            backgroundColor: 'white',
          }}
        >
          <Header bill={bill} scroll={this.state.scroll} />
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
            onScrollEndDrag={(e: any) => {
              if (!this.state.scrollAnimating) {
                let y = e.nativeEvent.contentOffset.y;
                let isDown = this.state.scrollDirection == ScrollDirection.down;
                if (
                  y > 0.05 * height &&
                  y < coverHeight - minimizedCoverHeight &&
                  isDown
                ) {
                  this.state.contentRef.current?.scrollTo({
                    y: coverHeight - minimizedCoverHeight,
                  });
                  this.setState({ scrollAnimating: true });
                }
              }
            }}
            overScrollMode="never"
            scrollToOverflowEnabled={true}
          >
            <Cover
              bill={bill}
              category={category}
              scroll={this.state.scroll}
              blurType={this.props.blurType}
            />
            <VoteCard bill={bill} scroll={this.state.scroll} />
            <Body bill={bill} />
          </Animated.ScrollView>
          {this.closeButton()}
          {this.likeButton()}
        </View>
      );
    } else {
      return <Skeleton loading={true} skeleton={Skeletons.BillInfo} />;
    }
  }

  likeButton = () => {
    const { bill, user, blurType } = this.props;
    if (bill) {
      let liked = UserHandler.hasLikedBill(user, bill);

      return (
        <View
          style={{
            position: 'absolute',
            width: 40,
            height: 40,
            top: '6%',
            right: '6%',
            zIndex: 100,
          }}
        >
          <BlurView
            style={[styles.likeButton]}
            blurType={blurType}
            blurAmount={15}
            overlayColor={'black'}
          >
            <TouchableOpacity
              style={{ width: '100%', height: '100%' }}
              onPress={() => {
                Network.likeBill(bill, !liked);
                store.dispatch(StorageService.billLike(bill, !liked));
              }}
            >
              <Animatable.View
                animation={liked ? 'pulse' : undefined}
                iterationCount="infinite"
                style={{
                  width: '100%',
                  height: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Icon
                  size={22}
                  name={liked ? 'bookmarks' : 'bookmark-outline'}
                  type="ionicon"
                  color={liked ? colors.bookmark : 'white'}
                />
              </Animatable.View>
            </TouchableOpacity>
          </BlurView>
        </View>
      );
    } else {
      return null;
    }
  };

  // generate the close button
  closeButton = () => {
    let { blurType } = this.props;
    return (
      <BlurView style={styles.closeButton} blurType={blurType}>
        <TouchableOpacity
          style={{
            width: '100%',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => {
            Odyssey.navigationRef.current?.goBack();
          }}
        >
          <Icon size={26} name="arrow-left" type="feather" color="white" />
        </TouchableOpacity>
      </BlurView>
    );
  };
}

function Title(props: {
  bill: Bill;
  category: Category;
  blurType: any;
  scroll: Animated.Value;
  opacity: Animated.AnimatedInterpolation;
  translateY: Animated.AnimatedInterpolation;
}) {
  const { bill, category, blurType, opacity } = props;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10,
        borderTopEndRadius: 10,
        borderTopStartRadius: 10,
        overflow: 'hidden',
        opacity: opacity,
        transform: [{ translateY: props.translateY }],
      }}
    >
      <BlurView
        style={{
          padding: 10,
          paddingHorizontal: '6%',
        }}
        blurType={'regular'}
        blurAmount={20}
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
        <Space height={5} />
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit={true}
          style={styles.title}
        >
          {bill.title}
        </Text>
      </BlurView>
    </Animated.View>
  );
}

function Cover(props: {
  bill: Bill;
  scroll: Animated.Value;
  category: Category;
  blurType: any;
}) {
  const { bill, scroll, category } = props;
  let isDark = tinycolor(category.bgColor).isDark();
  let titleOpacity = scroll.interpolate({
    inputRange: [0, coverHeight / 3],
    outputRange: [1, 0],
  });
  return (
    <>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View>
        <AnimatedSharedElement
          id={`bill.${bill.number}.photo`}
          style={[
            styles.imageContainer,
            {
              minHeight: minimizedCoverHeight,
              maxHeight: coverHeight,
              height: coverHeight,
              zIndex: 1,
              overflow: 'hidden',
              transform: [
                {
                  translateY: scroll.interpolate({
                    inputRange: [-coverHeight, 0, 1],
                    outputRange: [-coverHeight, 0, 0],
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
                    scale: scroll.interpolate({
                      inputRange: [-coverHeight, 0, coverHeight],
                      outputRange: [1.4, 1, 1],
                    }),
                  },
                ],
              },
            ]}
            source={{ uri: category.image }}
          />
        </AnimatedSharedElement>
        <Title
          bill={bill}
          category={category}
          blurType={props.blurType}
          scroll={scroll}
          opacity={titleOpacity}
          translateY={scroll.interpolate({
            inputRange: [-coverHeight, 0, 1],
            outputRange: [-coverHeight, 0, 0],
          })}
        />
      </View>
    </>
  );
}

function Header(props: { bill: Bill; scroll: Animated.Value }) {
  const { bill, scroll } = props;
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: '100%',
          height: minimizedCoverHeight,
          zIndex: 100,
          shadowRadius: 10,
          shadowOpacity: 0.35,
          shadowColor: 'black',
          shadowOffset: { width: 0, height: 2 },
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          overflow: 'hidden',
        },
        {
          opacity: scroll.interpolate({
            inputRange: [
              0,
              minimizedCoverHeight,
              coverHeight - minimizedCoverHeight,
            ],
            outputRange: [0, 0, 1],
            extrapolate: 'clamp',
          }),
        },
      ]}
    >
      <BlurView
        style={{
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
}

function Body(props: { bill: Bill }) {
  const { bill } = props;
  return (
    <View style={[styles.content]}>
      <Summary bill={bill} />
      <Space height={20} />
      <Comments bill={bill} />
      <Space height={20} />
      <BillStatus bill={bill} />
      <Space height={20} />
      <RepVote bill={bill} />
      <Space height={50} />
    </View>
  );
}

function VoteCard(props: { bill: Bill; scroll: Animated.Value }) {
  return (
    <Card
      style={{
        zIndex: 100,
        shadowColor: 'black',
        shadowRadius: 5,
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 3 },
        padding: '4%',
        transform: [
          {
            translateY: props.scroll.interpolate({
              inputRange: [
                -1,
                0,
                coverHeight - minimizedCoverHeight,
                coverHeight - minimizedCoverHeight + 1,
              ],
              outputRange: [-1, 0, 0, 1],
            }),
          },
        ],
      }}
      textStyle={{ fontSize: 20 }}
      label={'Vote'}
    >
      <Slider />
    </Card>
  );
}

class Comments extends React.Component<{ bill: Bill }, { data?: BillData }> {
  private unsubscribeStore;

  constructor(props: any) {
    super(props);

    this.state = {
      data: this.getBillDataFromStore(),
    };

    this.unsubscribeStore = store.subscribe(() => {
      let data = this.getBillDataFromStore();
      if (data != this.state.data) {
        this.setState({ data });
      }
    });
  }

  getBillDataFromStore() {
    const { ui } = store.getState();
    return ui.screen.code == UIScreenCode.bill ? ui.screen.billData : undefined;
  }

  shouldComponentUpdate(props: any, state: any) {
    return this.state.data != state.data;
  }

  componentWillUnmount() {
    this.unsubscribeStore();
  }

  render() {
    if (!this.state.data) {
      return (
        <Card label={'Top Comments'}>
          <Skeleton loading={true} skeleton={Skeletons.Comment}></Skeleton>
        </Card>
      );
    }

    const { bill } = this.props;
    const { yes, no } = BillHandler.extractTopComment(this.state.data);
    return (
      <Card label={'Top Comments'}>
        <View style={{ padding: 10 }}>
          <TopComment
            comment={{
              cid: '',
              date: 0,
              likes: {},
              name: '',
              text: `This bill is really good, but like also I like to suck your cock HEHEH.ur a fucking n word but i can't say it ad this iss so sad`,
              uid: '',
            }}
            position={'for'}
          />
          <Space height={10} />
          <TopComment
            comment={{
              cid: '',
              date: 0,
              likes: {},
              name: '',
              text: `This bill is really good, but like also I like to suck your cock HEHEH.ur a fucking n word but i can't say it ad this iss so sad`,
              uid: '',
            }}
            position={'against'}
          />
        </View>
        <Space height={15} />
        <View style={{ flexDirection: 'row' }}>
          <Button
            label="View All"
            color={'white'}
            textStyle={{ color: 'black' }}
          />
          <Space width={10} />
          <Button
            icon={{
              name: 'plus-square',
              type: 'feather',
              color: 'white',
              size: 18,
            }}
            label="Comment"
            color={colors.democrat}
          />
        </View>
      </Card>
    );
  }
}

function TopComment(props: { position: 'for' | 'against'; comment?: Comment }) {
  const { position, comment } = props;
  return (
    <View style={{ alignItems: 'flex-start' }}>
      <View
        style={{
          paddingVertical: 5,
          paddingHorizontal: 10,
          backgroundColor:
            position == 'for' ? colors.finishButtonColor : colors.republican,
          borderRadius: 5,
        }}
      >
        <Text style={{ color: 'white', fontFamily: 'Futura', fontSize: 15 }}>
          {position == 'for' ? 'For' : 'Against'}
        </Text>
      </View>
      <Space height={5} />
      <View>
        <Text>{comment ? comment.text : 'Be the first to comment!'}</Text>
      </View>
    </View>
  );
}

function Summary(props: { bill: Bill }) {
  const { bill } = props;
  return (
    <Card clickable label={'Summary'}>
      <Space height={10} />
      <Text
        numberOfLines={8}
        style={{ fontFamily: 'Futura', fontSize: 16, flex: 1 }}
      >
        {bill.short_summary.trim() + bill.full_summary.trim()}
      </Text>
    </Card>
  );
}

function BillStatus(props: { bill: Bill }) {
  const { bill } = props;
  return (
    <Card label={'Status'}>
      <Space height={10} />
      <BillProgressBar bill={bill} />
      <Space height={10} />
      <TouchableOpacity
        style={{
          backgroundColor: colors.democrat,
          padding: 10,
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 5,
          alignSelf: 'center',
        }}
      >
        <Text
          style={{ fontFamily: 'Futura', color: 'white', fontWeight: 'bold' }}
        >
          More Details
        </Text>
      </TouchableOpacity>
    </Card>
  );
}

class RepVote extends React.PureComponent<{ bill: Bill }, {}> {
  render() {
    const reps = store.getState().storage.representatives;
    const { bill } = this.props;
    let votesAndReps: [BillVotingEvent, Representative][] = [];

    if (!bill.voting_events) {
      return null;
    }

    reps.forEach((rep) => {
      let votes = undefined;
      bill.voting_events.forEach((v) => {
        if (v.Chamber == rep.chamber) {
          votes = v;
        }
      });

      if (votes) {
        votesAndReps.push([votes, rep]);
      }
    });

    if (votesAndReps.length == 0) {
      return null;
    }
    return (
      <Card label={'Your Officials Voted'}>
        <View
          style={{
            flexDirection: 'row',
            padding: 10,
            justifyContent: 'space-evenly',
          }}
        >
          {votesAndReps.map((item, i) => {
            let rep = item[1];
            let votes = item[0];

            let names = Object.keys(votes.Votes);
            let vote: any = undefined;

            names.forEach((name) => {
              let parts = name.split(',');
              let match = true;

              parts.forEach((part) => {
                if (!rep.name.includes(part)) {
                  match = false;
                }
              });

              if (match) {
                vote = votes.Votes[name];
              }
            });
            let color;
            let text;
            switch (vote) {
              case 'Y':
                color = '#00e676E0';
                text = 'For';
                break;
              case 'N':
                color = '#ff5252E0';
                text = 'Against';
                break;
              default:
                color = '#9e9e9eE0';
                text = 'None';
            }

            return (
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <View
                  style={{
                    width: 75,
                    height: 75,
                    overflow: 'hidden',
                    borderRadius: 5,
                  }}
                >
                  <Image
                    source={{ uri: rep.picture_url }}
                    style={{ width: '100%', height: '100%', borderRadius: 5 }}
                  />

                  <View
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: color,
                      padding: 5,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: 'Futura',
                        fontWeight: 'bold',
                        color: 'white',
                        fontSize: 12,
                      }}
                    >
                      {text}
                    </Text>
                  </View>
                </View>
                <Space height={7.5} />
                <Text style={{ fontFamily: 'Futura', fontSize: 16 }}>
                  {rep.name}
                </Text>
              </View>
            );
          })}
        </View>
      </Card>
    );
  }
}

function Card(props: {
  children?: React.ReactNode;
  clickable?: boolean;
  onPress?: () => void;
  style?: any;
  textStyle?: StyleProp<TextStyle>;
  label: string;
}) {
  return (
    <Animated.View style={[styles.card, props.style]}>
      <TouchableOpacity
        activeOpacity={props.clickable ? 0.35 : 1}
        onPress={props.onPress}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text style={[styles.section, props.textStyle]}>{props.label}</Text>
          {props.clickable ? (
            <View style={{}}>
              <Icon name={'chevron-right'} type={'feather'} color={'black'} />
            </View>
          ) : null}
        </View>
        {props.children}
      </TouchableOpacity>
    </Animated.View>
  );
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
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 2.5 },
  },
  image: {
    width: '100%',
    height: '100%',
    flex: 1,
  },
  content: {
    zIndex: 0,
    padding: '5%',
  },
  number: {
    fontFamily: 'Roboto-Light',
    fontWeight: '400',
    fontSize: 16,
    color: colors.white,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Futura',
    fontWeight: '500',
    marginTop: '1%',
    color: 'white',
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
    borderRadius: 10,
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
    borderRadius: 12.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  likeButton: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 12.5,
    justifyContent: 'center',
    alignItems: 'center',
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
    borderRadius: 7.5,
    shadowColor: 'black',
    shadowOpacity: 0.25,
    shadowRadius: 30,
    zIndex: 150,
    backgroundColor: colors.votingBackgroundColor,
    marginRight: '5%',
    flex: 7,
  },
  fullBill: {
    justifyContent: 'center',
    borderRadius: 7.5,
    backgroundColor: 'white',
    shadowColor: 'black',
    shadowOpacity: 0.25,
    width: height * 0.07,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 1 },
    zIndex: 150,
  },
  voteText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  section: {
    color: 'black',
    fontSize: 24,
    fontFamily: 'Roboto',
    fontWeight: '500',
  },
  card: {
    padding: '5%',
    backgroundColor: colors.textInputBackground,
    borderRadius: 5,
  },
});

export default connect(mapStoreToProps)(BillInfoScreen);
