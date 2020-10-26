import React from 'react';
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

interface Props {
  navigation: BillDetailsInfoScreenProps;
  route: BillDetailInfoScreenRouteProps;
}

type State = {
  expanded: boolean;
  animation: Animated.Value;
  numberLines: number | undefined;
  liked: boolean;
  transition: Animated.Value;
  transitionComplete: boolean;
  contentRef: React.RefObject<View>;
  likeY: number;
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

export default class BillInfoScreen extends React.PureComponent<Props, State> {
  private billImage = React.createRef<View>();

  constructor(props: Props) {
    super(props);
    this.state = {
      expanded: false,
      animation: new Animated.Value(0),
      numberLines: 5,
      liked: false,
      transition: new Animated.Value(0),
      transitionComplete: true,
      contentRef: React.createRef<View>(),
      likeY: 220,
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

  renderLayer() {
    const {
      bill,
      category,
      imageDims,
      textCardDims,
      cardDims,
    } = this.props.route.params;
    const { height, width } = Dimensions.get('screen');

    return (
      <Animated.View
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          zIndex: 100,
          backgroundColor: this.state.transition.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: ['transparent', 'white', 'white'],
          }),
        }}
      >
        <Animated.View
          style={{
            position: 'absolute',
            width: this.state.transition.interpolate({
              inputRange: [0, 0.5, 0.85, 1],
              outputRange: [imageDims.width, width * 1.1, width, width],
            }),
            height: this.state.transition.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [imageDims.height, height * 0.33, height * 0.33],
            }),
            top: this.state.transition.interpolate({
              inputRange: [0, 0.85, 1],
              outputRange: [imageDims.pageY, 0, 0],
            }),
            right: this.state.transition.interpolate({
              inputRange: [0, 0.5, 0.85, 1],
              outputRange: [imageDims.pageX, -width * 0.05, 0, 0],
            }),
            shadowColor: 'black',
            shadowOpacity: this.state.transition.interpolate({
              inputRange: [0, 0.25, 1],
              outputRange: [0, 0.5, 0.5],
            }),
            shadowRadius: 15,
            shadowOffset: { width: 0, height: 10 },
            zIndex: 200,
            borderRadius: 30,
            borderBottomLeftRadius: this.state.transition.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 30],
            }),
            borderBottomRightRadius: this.state.transition.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 30],
            }),
          }}
        >
          <Animated.Image
            style={[
              styles.image,
              {
                borderRadius: 35,
                borderBottomLeftRadius: this.state.transition.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 30],
                }),
                borderBottomRightRadius: this.state.transition.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 30],
                }),
                transform: [
                  {
                    scale: this.state.transition.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [1, 1.03, 1],
                    }),
                  },
                ],
              },
            ]}
            source={{ uri: category.image }}
          />
        </Animated.View>
        <Animated.View
          style={{
            position: 'absolute',
            width: this.state.transition.interpolate({
              inputRange: [0, 0.75, 1],
              outputRange: [cardDims.width, width, width],
            }),
            height: this.state.transition.interpolate({
              inputRange: [0, 0.75, 1],
              outputRange: [cardDims.height, height * 0.67, height * 0.67],
            }),
            top: this.state.transition.interpolate({
              inputRange: [0, 0.75, 1],
              outputRange: [cardDims.pageY, height * 0.33, height * 0.33],
            }),
            right: this.state.transition.interpolate({
              inputRange: [0, 0.75, 1],
              outputRange: [cardDims.pageX, 0, 0],
            }),
            backgroundColor: 'white',
            flex: 2,
            shadowColor: 'black',
            shadowRadius: 15,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: this.state.transition.interpolate({
              inputRange: [0, 0.35, 1],
              outputRange: [0.25, 0, 0],
            }),
            zIndex: 10,
            borderRadius: this.state.transition.interpolate({
              inputRange: [0, 1],
              outputRange: [25, 0],
            }),
            paddingVertical: '5%',
            paddingHorizontal: '7.5%',
          }}
        >
          <View style={{ flex: 1 }}>
            <View style={styles.categoriesContainer}>
              <Text style={styles.number}>{formatBillNumber(bill)}</Text>

              <View
                style={[
                  styles.category,
                  { backgroundColor: category.categoryColor },
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    {
                      color: category.categoryTextColor,
                    },
                  ]}
                >
                  {bill.category}
                </Text>
              </View>
            </View>
            <Text
              style={[styles.title]}
              numberOfLines={2}
              adjustsFontSizeToFit={true}
            >
              {bill.title}
            </Text>
            <Animated.View
              style={{
                flex: 1,
                opacity: this.state.transition.interpolate({
                  inputRange: [0, 0.15, 0.65, 1],
                  outputRange: [1, 0, 0, 1],
                }),

                height: this.state.transition.interpolate({
                  inputRange: [0, 0.05, 0.65, 1],
                  outputRange: ['100%', '0%', '0%', '100%'],
                }),
                overflow: 'hidden',
              }}
            >
              <Text ellipsizeMode="tail" style={[styles.synopsis]}>
                {bill.short_summary}
              </Text>
            </Animated.View>
          </View>
        </Animated.View>
        <Animated.View
          style={{
            height: height * 0.07,
            width: width * 0.85,
            position: 'absolute',
            bottom: height * 0.035,
            zIndex: 10000,
            left: width * 0.075,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: this.state.transition.interpolate({
              inputRange: [0, 0.75, 1],
              outputRange: [0, 0, 1],
            }),
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
          <View style={styles.voteButton}>
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
          </View>
        </Animated.View>
        <Animated.View
          style={[
            styles.closeButton,
            {
              opacity: this.state.transition.interpolate({
                inputRange: [0, 0.75, 1],
                outputRange: [0, 0, 1],
              }),
              zIndex: 10000,
            },
          ]}
        >
          <Icon size={26} name="arrow-left" type="feather" color="black" />
        </Animated.View>
        <Animated.View
          style={[
            styles.likeButton,
            {
              opacity: this.state.transition.interpolate({
                inputRange: [0, 0.75, 1],
                outputRange: [0, 0, 1],
              }),
              zIndex: 10000,
            },
          ]}
        >
          <Icon
            size={30}
            name={this.state.liked ? 'heart-sharp' : 'heart-outline'}
            type="ionicon"
            color={this.state.liked ? colors.republican : 'black'}
          />
        </Animated.View>
      </Animated.View>
    );
  }

  renderTransitionLayer() {
    const { category, imageDims } = this.props.route.params;
    const { height, width } = Dimensions.get('screen');
    return (
      <View
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          zIndex: 100,
          backgroundColor: 'white',
        }}
      ></View>
    );
  }

  render() {
    const { bill, category } = this.props.route.params;
    const { height, width } = Dimensions.get('screen');
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: 'white',
        }}
      >
        <SharedElement
          id={`bill.${bill.number}.photo`}
          style={[styles.imageContainer, { height: 0.33 * height }]}
        >
          <FastImage style={styles.image} source={{ uri: category.image }} />
        </SharedElement>
        <View
          ref={this.state.contentRef}
          style={[styles.content, { height: 0.67 * height }]}
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

          <ScrollView>
            <Text ellipsizeMode="tail" style={styles.synopsis}>
              {bill.short_summary}
            </Text>
          </ScrollView>
          <View
            style={{
              height: height * 0.07,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-start',
              marginBottom: '7%',
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
        </View>
        {this.closeButton()}
        {this.likeButton()}
      </View>
    );
  }

  likeButton = () => {
    this.state.contentRef.current?.measure((x, y) => {
      this.setState({ likeY: y - 65 });
    });
    return (
      <Animatable.View
        animation={'fadeIn'}
        style={[styles.likeButton, { top: '25%' }]}
      >
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
    zIndex: 2,
    shadowColor: 'black',
    shadowOpacity: 0.5,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 2.5 },
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    flex: 1,
  },
  content: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingVertical: '5%',
    paddingBottom: '2%',
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
    width: 45,
    height: 45,
    right: '6%',
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
