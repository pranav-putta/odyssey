import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import {colors} from '../../../assets';
import {Image} from 'react-native-animatable';
import BillItem from './components/BillItem';
import {SharedElement} from 'react-navigation-shared-element';
import {Icon} from 'react-native-elements';
import FloatingTabBar from '../../../components/FloatingTabHub';

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
};
type State = {
  expanded: boolean;
  animation: Animated.Value;
  numberLines: number | undefined;
};

const width = Dimensions.get('screen').width;
const height = Dimensions.get('screen').height;

class BillDetailScreen extends React.Component<Props, State> {
  screenWidth: Animated.AnimatedInterpolation;
  screenHeight: Animated.AnimatedInterpolation;
  screenMarginTop: Animated.AnimatedInterpolation;
  textOpacity: Animated.AnimatedInterpolation;

  constructor(props: Props) {
    super(props);

    this.state = {
      expanded: false,
      animation: new Animated.Value(0),
      numberLines: 5,
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
  }

  // expand the card outward
  expand = () => {
    Animated.timing(this.state.animation, {
      toValue: 1,
      useNativeDriver: false,
      duration: 250,
    }).start(() => {
      this.setState({expanded: true});
    });
    this.setState({numberLines: undefined});
  };

  // collapse the card
  collapse = () => {
    this.setState({numberLines: 5});

    Animated.timing(this.state.animation, {
      toValue: 0,
      useNativeDriver: false,
      duration: 250,
    }).start(() => {
      this.props.onClose();
      this.setState({expanded: false});
    });
  };

  // generate the close button
  backButton = () => {
    return (
      <Animated.View
        style={[styles.backButton, {opacity: this.state.animation}]}>
        <TouchableOpacity
          style={styles.backButtonTouchable}
          onPress={() => {
            this.collapse();
          }}>
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
      this.textOpacity = this.state.animation.interpolate({
        inputRange: [0, 0.1, 0.9, 1],
        outputRange: [1, 0, 0, 1],
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
            },
          ]}>
          <FloatingTabBar />
          <SharedElement
            style={styles.imageContainer}
            id={`item.${this.props.item.id}.photo`}>
            <Image
              style={styles.image}
              source={require('../../../assets/images/card.png')}
            />
          </SharedElement>
          <View style={styles.content}>
            <View style={styles.categoriesContainer}>
              <Text style={styles.number}>{this.props.item.id}</Text>

              <View
                style={[
                  styles.category,
                  {backgroundColor: this.props.item.categoryColor},
                ]}>
                <Text
                  style={[
                    styles.categoryText,
                    {color: this.props.item.categoryTextColor},
                  ]}>
                  {this.props.item.category}
                </Text>
              </View>
            </View>
            <Text style={styles.title}>{this.props.item.title}</Text>
            <Text ellipsizeMode="tail" style={styles.synopsis}>
              {this.props.item.description}
            </Text>
          </View>
          {this.backButton()}
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
    flex: 4,
  },
  image: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  content: {
    margin: '5%',
    backgroundColor: 'white',
    borderRadius: 30,
    paddingVertical: '5%',
    paddingHorizontal: '7.5%',
    flex: 5,
    shadowColor: 'black',
    shadowOpacity: 0.5,
    shadowRadius: 15,
    shadowOffset: {width: 0, height: 2.5},
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
  categoryText: {color: 'white', fontWeight: 'bold'},
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
});

export default BillDetailScreen;
