import React from 'react';
import {
  View,
  Image,
  Text,
  Animated,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import {
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native-gesture-handler';
import { Icon } from 'react-native-elements';
import { colors } from '../../../../assets';
import { BillFloatingTabKey } from '../../../../components/BillFloatingTabs';

interface Props {}

interface State {}

export default class BillVotingScreen extends React.Component<Props, State> {
  yayAnimation: Animated.Value;
  noAnimation: Animated.Value;

  constructor(props: Props) {
    super(props);
    this.yayAnimation = new Animated.Value(0);
    this.noAnimation = new Animated.Value(0);
  }

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
