import React from 'react';
import {
  Alert,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActionSheetIOS,
  Image,
  Dimensions,
} from 'react-native';
import { Icon } from 'react-native-elements';
import FastImage from 'react-native-fast-image';
import { colors } from '../../../assets';
import dateformat from 'dateformat';
import ProgressHUD from '../../../components/ProgressHUD';
import { BillData, Comment } from '../../../models/BillData';
import {
  deleteComment,
  fetchUser,
  getBillData,
  likeComment,
  setBillVote,
} from '../../../util';
import {
  BillDetailsVoteScreenProps,
  BillDetailVoteScreenRouteProps,
} from './BillDetailsStack';
import { User } from '../../../models';
import Clipboard from '@react-native-community/clipboard';
import { Analytics } from '../../../util/AnalyticsHandler';

enum Vote {
  None = -1,
  Yes = 0,
  No = 1,
}
type Props = {
  navigation: BillDetailsVoteScreenProps;
  route: BillDetailVoteScreenRouteProps;
};
type State = {
  vote: Vote;
  billData: BillData;
  progress: boolean;
  user?: User;
};

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(
  TouchableOpacity
);

function ButtonGroup(props: {
  buttons: string[];
  activeColors: string[];
  percentages: number[];
  inactiveColor: string;
  activeIndex: number;
  onPress: (index: number) => Promise<void>;
}) {
  let borderRadius = 5;
  let animations = props.buttons.map(
    () => React.useRef(new Animated.Value(0)).current
  );
  let percentAnimations = props.buttons.map(
    () => React.useRef(new Animated.Value(0)).current
  );
  const width = Dimensions.get('screen').width * 0.85;
  const height = Dimensions.get('screen').height * 0.125;
  return (
    <View style={styles.buttonGroup}>
      {props.buttons.map((val, ind) => {
        let bgColor = animations[ind].interpolate({
          inputRange: [0, 1],
          outputRange: [props.inactiveColor, props.activeColors[ind]],
        });
        let textColor = animations[ind].interpolate({
          inputRange: [0, 1],
          outputRange: ['black', 'white'],
        });
        let percent = percentAnimations[ind].interpolate({
          inputRange: [0, 1],
          outputRange: [0.5 * width, props.percentages[ind] * width],
        });
        let textOpacity = percentAnimations[ind].interpolate({
          inputRange: [0, 1],
          outputRange: [1, props.percentages[ind] == 0 ? 0 : 1],
        });

        Animated.timing(animations[ind], {
          toValue: props.activeIndex == ind ? 1 : 0,
          useNativeDriver: false,
          duration: 200,
        }).start();

        Animated.timing(percentAnimations[ind], {
          toValue: props.activeIndex != -1 ? 1 : 0,
          useNativeDriver: false,
          duration: 200,
        }).start();
        return (
          <AnimatedTouchableOpacity
            key={val}
            onPress={async () => {
              await props.onPress(ind);

              if (ind != props.activeIndex) {
                Animated.timing(animations[ind], {
                  toValue: 1,
                  useNativeDriver: false,
                  duration: 200,
                }).start();
                if (props.activeIndex != -1) {
                  Animated.timing(animations[props.activeIndex], {
                    toValue: 0,
                    useNativeDriver: false,
                    duration: 200,
                  }).start();
                }
                props.buttons.forEach((val, i) => {
                  Animated.timing(percentAnimations[i], {
                    toValue: 1,
                    useNativeDriver: false,
                    duration: 200,
                  }).start(() => {});
                });
              } else {
                Animated.parallel([
                  ...props.buttons.map((val, i) =>
                    Animated.timing(percentAnimations[i], {
                      toValue: 0,
                      useNativeDriver: false,
                      duration: 200,
                    })
                  ),
                  Animated.timing(animations[ind], {
                    toValue: 0,
                    useNativeDriver: false,
                    duration: 200,
                  }),
                ]).start(() => {
                  props.onPress(-1);
                });
              }
            }}
            style={[
              styles.button,
              {
                width: percent,
                backgroundColor: bgColor,
                borderTopLeftRadius: ind == 0 ? borderRadius : 0,
                borderBottomLeftRadius: ind == 0 ? borderRadius : 0,
                borderBottomRightRadius:
                  ind == props.buttons.length - 1 ? borderRadius : 0,
                borderTopRightRadius:
                  ind == props.buttons.length - 1 ? borderRadius : 0,
                overflow: 'hidden',
                //borderRightWidth: ind == 0 ? 0.5 : 0,
                //borderColor: 'gray',
              },
            ]}
          >
            <Animated.Text
              style={[
                styles.buttonText,
                {
                  color: textColor,
                  overflow: 'hidden',
                  opacity: textOpacity,
                  transform: [
                    {
                      translateY: percentAnimations[ind].interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -25],
                      }),
                    },
                  ],
                  fontSize: percentAnimations[ind].interpolate({
                    inputRange: [0, 1],
                    outputRange: [25, 25],
                  }),
                },
              ]}
            >
              {val}
            </Animated.Text>
            {props.activeIndex != -1 && (
              <Animated.Text
                style={{
                  fontSize: 30,
                  fontFamily: 'Futura',
                  fontWeight: 'bold',
                  color: props.activeIndex == ind ? 'white' : 'black',
                  position: 'absolute',
                  opacity: percentAnimations[ind].interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1],
                  }),
                  transform: [{ translateY: 10 }, { translateX: 10 }],
                }}
              >
                {Math.round(props.percentages[ind] * 100) + '%'}
              </Animated.Text>
            )}
          </AnimatedTouchableOpacity>
        );
      })}
    </View>
  );
}

export default class VoteScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      vote: Vote.None,
      billData: {
        bill_id: props.route.params.bill.number,
        comments: [],
        votes: {},
      },
      progress: false,
      user: undefined,
    };
  }

  componentDidMount() {
    this.reload();
    this.props.navigation.addListener('focus', this.reload);
  }

  reload = () => {
    this.setState({ progress: true });
    getBillData(this.props.route.params.bill).then(async (val) => {
      this.setState({ billData: val, progress: false });

      let user = await fetchUser();
      this.setState({ user: user });
      if (Object.keys(val.votes).includes(user.uid)) {
        this.setState({ vote: val.votes[user.uid] });
      }
    });
  };

  render() {
    let comments = this.state.billData.comments;
    let top = undefined;
    let max = -1;
    for (const comment of comments) {
      if (Object.keys(comment.likes).length > max) {
        top = comment;
        max = Object.keys(comment.likes).length;
      }
    }
    let yesVotes = Object.values(this.state.billData.votes).filter(
      (val) => val == Vote.Yes
    ).length;
    let noVotes = Object.values(this.state.billData.votes).filter(
      (val) => val == Vote.No
    ).length;
    let votes = Object.values(this.state.billData.votes).filter(
      (val) => val != Vote.None
    ).length;
    if (votes > 0) {
      yesVotes = yesVotes / votes;
      noVotes = noVotes / votes;
    } else {
      yesVotes = 0.5;
      noVotes = 0.5;
    }
    return (
      <View style={styles.container}>
        <ProgressHUD visible={this.state.progress} />
        <View style={styles.header}>
          {this.closeButton()}
          <Text style={styles.headerText}>Vote</Text>
        </View>
        <ButtonGroup
          buttons={['Yes', 'No']}
          activeColors={['#69f0ae', '#ff8a80']}
          inactiveColor={'#fff'}
          activeIndex={this.state.vote}
          percentages={[yesVotes, noVotes]}
          onPress={async (index) => {
            return new Promise<void>((resolve, reject) =>
              this.setState({ vote: index }, () => {
                Analytics.voteEvent(this.props.route.params.bill, index);
                setBillVote(this.props.route.params.bill, this.state.vote);
                if (this.state.user) {
                  let billData = this.state.billData;
                  billData.votes[this.state.user.uid] = index;
                  this.setState({ billData: billData });
                }
                resolve();
              })
            );
          }}
        />
        {top ? (
          <ScrollView style={{ marginTop: '10%' }} nestedScrollEnabled={true}>
            {this.topComment(top)}
            {this.comments(comments)}
          </ScrollView>
        ) : (
          <View
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          >
            <Text style={{ fontFamily: 'Futura', fontSize: 24 }}>
              No comments yet!
            </Text>
          </View>
        )}

        {this.newComment()}
      </View>
    );
  }

  topComment = (top: Comment) => {
    let vote = this.state.billData.votes[top.uid];
    let formattedDate = dateformat(new Date(top.date), 'mmm dd, yyyy');

    let picture = `https://odyssey-user-pfp.s3.us-east-2.amazonaws.com/${top.uid}_pfp.jpg`;
    return (
      <TouchableOpacity
        style={styles.topComment}
        onPress={() => {
          Analytics.commentClicked(this.props.route.params.bill, top);
          this.props.navigation.push('CommentFullScreen', {
            comment: top,
            formattedDate: formattedDate,
            voteColor: this.voteToColor(vote),
            voteText: this.voteToText(vote),
          });
        }}
      >
        <Icon
          type="font-awesome-5"
          name="quote-right"
          size={60}
          color={colors.textInputBackground}
          containerStyle={styles.bigQuoteFloatingIcon}
        />
        <Icon
          type="font-awesome-5"
          name="quote-left"
          size={20}
          color={'white'}
          containerStyle={styles.quoteIcon}
        />
        <Text
          style={{
            fontFamily: 'Futura',
            fontSize: 20,
            marginTop: '5%',
            lineHeight: 20,
          }}
          ellipsizeMode="tail"
          numberOfLines={3}
        >
          {top.text}
        </Text>
        <View
          style={{
            flexDirection: 'row',
          }}
        >
          <Image
            style={styles.profile}
            source={{
              uri: picture + '?cache=' + Date.now(),
            }}
          />
          <View style={styles.profileName}>
            <View style={{ flexDirection: 'row' }}>
              <Text
                style={{
                  fontFamily: 'Futura',
                  fontSize: 16,
                  fontWeight: '600',
                }}
              >
                {top.name}
              </Text>
              <View
                style={{
                  backgroundColor: this.voteToColor(vote),
                  paddingVertical: 2,
                  paddingHorizontal: 8,
                  marginLeft: 8,
                  borderRadius: 5,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    fontFamily: 'Futura',
                    color: 'white',
                    fontWeight: '500',
                  }}
                >
                  {this.voteToText(vote)}
                </Text>
              </View>
            </View>

            <Text
              style={{
                fontFamily: 'Futura',
                fontSize: 15,
                color: 'gray',
              }}
            >
              Top Comment
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  voteToText = (vote: Vote) => {
    if (vote == undefined) {
      return 'Abstain';
    }

    switch (vote) {
      case Vote.No:
        return 'Against';
      case Vote.Yes:
        return 'For';
      case Vote.None:
        return 'Abstain';
    }
  };

  voteToColor = (vote: Vote) => {
    if (vote == undefined) {
      return 'Abstain';
    }
    switch (vote) {
      case Vote.No:
        return '#ff8a80';
      case Vote.Yes:
        return '#69f0ae';
      case Vote.None:
        return colors.textInputBackground;
    }
  };

  comment = (comment: Comment, index: number) => {
    let formattedDate = dateformat(new Date(comment.date), 'mmm dd, yyyy');
    let isLiked = this.state.user
      ? comment.likes[this.state.user.uid] !== undefined &&
        comment.likes[this.state.user.uid]
      : false;
    let picture = `https://odyssey-user-pfp.s3.us-east-2.amazonaws.com/${comment.uid}_pfp.jpg`;

    // search for position of comment user
    let vote = this.state.billData.votes[comment.uid];

    return (
      <TouchableOpacity
        key={comment.name + comment.text}
        activeOpacity={0.6}
        onPress={() => {
          Analytics.commentClicked(this.props.route.params.bill, comment);
          this.props.navigation.push('CommentFullScreen', {
            comment: comment,
            formattedDate: formattedDate,
            voteColor: this.voteToColor(vote),
            voteText: this.voteToText(vote),
          });
        }}
        onLongPress={() => {
          let options = ['Copy', 'Cancel'];
          if (this.state.user && this.state.user.uid == comment.uid) {
            options = ['Copy', 'Delete', 'Cancel'];
          }

          ActionSheetIOS.showActionSheetWithOptions(
            {
              options: options,
              destructiveButtonIndex: 1,
              cancelButtonIndex: 2,
            },
            (btn) => {
              if (btn == 0) {
                Analytics.commentCopied(this.props.route.params.bill, comment);
                Clipboard.setString(comment.text);
              } else if (
                btn == 1 &&
                this.state.user &&
                this.state.user.uid == comment.uid
              ) {
                Analytics.commentDeleted(this.props.route.params.bill, comment);
                deleteComment(this.props.route.params.bill, index).then();
                let billData = this.state.billData;
                billData.comments.splice(index, 1);
                this.setState({ billData: billData });
              }
            }
          );
        }}
      >
        <View
          style={{
            flexDirection: 'row',
          }}
        >
          <Image
            style={styles.profile}
            source={{
              uri: picture,
            }}
          />
          <View
            style={{
              padding: '1%',
              paddingHorizontal: '5%',
              marginTop: '5%',
              flex: 1,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text
                  style={{
                    fontFamily: 'Futura',
                    fontSize: 16,
                    fontWeight: '600',
                  }}
                >
                  {comment.name}
                </Text>
                <View
                  style={{
                    backgroundColor: this.voteToColor(vote),
                    paddingVertical: 3,
                    paddingHorizontal: 8,
                    borderRadius: 5,
                    marginLeft: 7.5,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: 'Futura',
                      color: 'white',
                      fontWeight: '500',
                    }}
                  >
                    {this.voteToText(vote)}
                  </Text>
                </View>
              </View>
              <Text
                style={{
                  fontFamily: 'Futura',
                  fontSize: 12,
                  color: '#9e9e9e',
                }}
              >
                {formattedDate}
              </Text>
            </View>
            <Text
              style={{
                fontFamily: 'Futura',
                fontSize: 15,
                lineHeight: 20,
                marginTop: '2.5%',
              }}
              numberOfLines={5}
              ellipsizeMode="tail"
            >
              {comment.text}
            </Text>
            <View style={{ flexDirection: 'row', marginTop: '2.5%' }}>
              <TouchableOpacity
                style={{
                  backgroundColor: colors.textInputBackground,
                  padding: '2.5%',
                  borderRadius: 5,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
                onPress={() => {
                  if (this.state.user) {
                    let billData = this.state.billData;
                    let like = !billData.comments[index].likes[
                      this.state.user.uid
                    ];
                    Analytics.commentLikeChange(
                      this.props.route.params.bill,
                      comment,
                      like
                    );

                    billData.comments[index].likes[
                      this.state.user.uid
                    ] = !billData.comments[index].likes[this.state.user.uid];
                    this.setState({ billData: billData });
                    likeComment(
                      this.props.route.params.bill,
                      index,
                      billData.comments[index].likes[this.state.user.uid]
                    );
                  }
                }}
              >
                <Icon
                  type="ionicon"
                  color={isLiked ? colors.republican : 'black'}
                  name={isLiked ? 'heart-sharp' : 'heart-outline'}
                  size={16}
                />
                <Text
                  style={{
                    fontFamily: 'Futura',
                    fontWeight: '500',
                    paddingLeft: '2.5%',
                  }}
                >
                  {Object.values(comment.likes).filter(Boolean).length}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  comments = (comments: Comment[]) => {
    return (
      <View style={styles.commentBox}>
        {comments.map((val, i) => this.comment(val, i))}
      </View>
    );
  };

  newComment = () => {
    return (
      <View
        style={{
          width: '100%',
          height: '10%',
          backgroundColor: 'white',
          padding: '2.5%',
          paddingHorizontal: '7.5%',
          shadowColor: 'black',
          shadowOpacity: 0.25,
          shadowOffset: { width: 0, height: 1 },
          shadowRadius: 7.5,
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
        }}
      >
        <TouchableOpacity
          style={{
            backgroundColor: colors.textInputBackground,
            borderRadius: 10,
            flexDirection: 'row',
          }}
          onPress={() => {
            Analytics.createCommentButtonClicked(this.props.route.params.bill);
            this.props.navigation.push('Comment', {
              bill: this.props.route.params.bill,
            });
          }}
        >
          <Text
            style={{ margin: '4%', flex: 5, fontSize: 16, color: '#9e9e9e' }}
          >
            Share your thoughts
          </Text>
          <View
            style={{
              backgroundColor: '#448aff',
              justifyContent: 'center',
              alignItems: 'center',
              flex: 1,
              borderRadius: 10,
            }}
          >
            <Icon type="feather" name="send" size={24} color={'white'} />
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  // generate the close button
  closeButton = () => {
    return (
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => {
          this.props.navigation.pop();
        }}
      >
        <Icon size={26} name="arrow-left" type="feather" color="black" />
      </TouchableOpacity>
    );
  };
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
  },
  container: {
    flex: 1,
    marginTop: '7.5%',
  },
  closeButton: {
    width: 40,
    height: 40,
    zIndex: 100,
    borderRadius: 12.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: '5%',
    marginHorizontal: '7.5%',
  },
  headerText: {
    marginLeft: '5%',
    fontFamily: 'Futura',
    fontWeight: '600',
    fontSize: 26,
  },
  buttonGroup: {
    width: '85%',
    height: '12.5%',
    marginHorizontal: '7.5%',

    flexDirection: 'row',
    marginTop: '5%',
    shadowColor: 'black',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 1 },
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 25,
  },
  topComment: {
    width: '96%',
    borderRadius: 10,
    paddingVertical: '5%',
    paddingHorizontal: '7.5%',
    shadowColor: 'black',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 1 },
    backgroundColor: 'white',
    marginHorizontal: '2%',
  },
  commentBox: {
    width: '100%',
    borderRadius: 10,

    paddingVertical: '2.5%',
    paddingHorizontal: '7.5%',
    backgroundColor: 'white',
    marginTop: '5%',
  },
  quoteIcon: {
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0091ea',
    borderRadius: 5,
    shadowColor: 'black',
    shadowOpacity: 0.55,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 1 },
  },
  profile: { width: 45, height: 45, marginTop: '5%', borderRadius: 40 },
  profileName: {
    justifyContent: 'flex-end',
    padding: '1%',
    paddingHorizontal: '5%',
    flex: 1,
  },
  bigQuoteFloatingIcon: {
    position: 'absolute',
    bottom: '10%',
    right: '10%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
