import React from 'react';
import {
  Animated,
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

interface Props {
  navigation: BillDetailsInfoScreenProps;
  route: BillDetailInfoScreenRouteProps;
}

type State = {
  expanded: boolean;
  animation: Animated.Value;
  numberLines: number | undefined;
  liked: boolean;
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
  constructor(props: Props) {
    super(props);
    this.state = {
      expanded: false,
      animation: new Animated.Value(0),
      numberLines: 5,
      liked: false,
    };

    fetchUser().then((user) => {
      if (user.liked[props.route.params.bill.number]) {
        this.setState({ liked: true });
      }
    });
  }
  componentDidMount() {}

  render() {
    const { bill, category } = this.props.route.params;
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: 'white',
        }}
      >
        <View style={styles.imageContainer}>
          <FastImage style={styles.image} source={{ uri: category.image }} />
        </View>
        <View style={[styles.content]}>
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
                  { color: category.categoryTextColor },
                ]}
              >
                {bill.category}
              </Text>
            </View>
          </View>
          <Text style={styles.title}>{bill.title}</Text>

          <ScrollView>
            <Text ellipsizeMode="tail" style={styles.synopsis}>
              {bill.short_summary}
            </Text>
          </ScrollView>
          <View
            style={{
              height: '10%',
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
              iterationDelay={5000}
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
    return (
      <TouchableOpacity
        style={styles.likeButton}
        onPress={() => {
          likeBill(this.props.route.params.bill, !this.state.liked);
          storeBillLike(this.props.route.params.bill, !this.state.liked);
          this.setState({ liked: !this.state.liked });
        }}
      >
        <Icon
          size={30}
          name={this.state.liked ? 'heart-sharp' : 'heart-outline'}
          type="ionicon"
          color={this.state.liked ? colors.republican : 'black'}
        />
      </TouchableOpacity>
    );
  };

  // generate the close button
  closeButton = () => {
    return (
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => {
          this.props.navigation.goBack();
        }}
      >
        <Icon size={26} name="arrow-left" type="feather" color="black" />
      </TouchableOpacity>
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
    flex: 1,
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
    backgroundColor: 'white',
    borderRadius: 20,
    paddingVertical: '5%',
    paddingBottom: '2%',
    paddingHorizontal: '7.5%',
    flex: 2,

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
    backgroundColor: colors.textInputBackground,
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
    width: 50,
    height: 50,
    right: '6%',
    top: '25%',
    zIndex: 100,
    backgroundColor: 'rgba(236, 239, 241, 0.9)',
    borderRadius: 30,
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
