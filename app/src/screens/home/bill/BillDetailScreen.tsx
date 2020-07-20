import React from 'react';
import {View, Text, StyleSheet, Animated, TouchableOpacity} from 'react-native';
import {colors} from '../../../assets';
import {Image} from 'react-native-animatable';
import BillItem from './components/BillItem';
import {SharedElement} from 'react-navigation-shared-element';
import {Icon} from 'react-native-elements';

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
      outputRange: ['73.5%', '100%'],
    });
    this.screenHeight = this.state.animation.interpolate({
      inputRange: [0, 1],
      outputRange: ['46.5%', '100%'],
    });
    this.screenMarginTop = this.state.animation.interpolate({
      inputRange: [0, 1],
      outputRange: ['62.25%', '0%'],
    });
    this.textOpacity = this.state.animation.interpolate({
      inputRange: [0, 0.1, 0.9, 1],
      outputRange: [1, 0, 0, 1],
    });
  }

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
            },
          ]}>
          <SharedElement
            style={styles.imageContainer}
            id={`item.${this.props.item.id}.photo`}>
            <Image
              style={styles.image}
              source={require('../../../assets/images/card-temp.jpg')}
            />
          </SharedElement>
          <View style={styles.content}>
            <View style={styles.categoriesContainer}>
              <Text style={styles.number}>{this.props.item.id}</Text>

              <View style={styles.category}>
                <Text style={styles.categoryText}>
                  {this.props.item.category}
                </Text>
              </View>
            </View>
            <Text style={styles.title}>{this.props.item.title}</Text>
            <Text style={styles.header}>Synposis</Text>
            <Animated.Text
              numberOfLines={this.state.numberLines}
              style={[styles.synopsis, {opacity: this.textOpacity}]}>
              {this.props.item.description}
            </Animated.Text>
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
    width: '98%',
    height: '65%',
    alignSelf: 'center',
    backgroundColor: 'white',
    marginHorizontal: '6%',
    marginTop: '2%',
    borderRadius: 20,
    borderColor: 'red',
  },
  imageContainer: {
    width: '100%',
    flex: 3,
  },
  image: {
    flex: 1,
    width: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  content: {
    paddingVertical: '5%',
    paddingHorizontal: '7.5%',
    flex: 4,
  },
  number: {
    fontWeight: 'bold',
    color: colors.darkGray,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
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
    borderRadius: 20,
  },
  categoryText: {color: 'white', fontWeight: 'bold'},
  header: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: '10%',
  },
  synopsis: {
    marginTop: '1.25%',
    fontWeight: '400',
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
