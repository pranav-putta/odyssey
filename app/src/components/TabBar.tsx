import React from 'react';
import { StyleSheet, Alert, Animated, Dimensions } from 'react-native';
import TabBarItem from './TabBarItem';
import { colors } from '../assets';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from '@react-native-community/blur';
// key enum for each tab
export enum TabKey {
  bills = 'Bills',
  search = 'Search',
  liked = 'Liked',
  profile = 'Profile',
}

export interface TabModel {
  icon: {
    name: string;
    type: string;
  };
  tkey: TabKey;
  width: number;
  color?: string;
  textColor?: string;
  label: string;
}

type State = {
  active: string;
  shown: boolean;
};

type Props = {
  zIndex?: number;
  show: boolean;
  current: string;
  tabPressed: (tab: string) => void;
  tabs: TabModel[];
};

const screenWidth = Dimensions.get('screen').width;
const tickerLength = screenWidth * 0.1;

class TabBar extends React.Component<Props, State> {
  bottomVal: Animated.AnimatedInterpolation;
  animation: Animated.Value;
  tickerAnimation: Animated.Value;
  tickerLocation: Animated.AnimatedInterpolation;
  tickerColor: Animated.AnimatedInterpolation;

  constructor(props: Props) {
    super(props);

    this.state = {
      active: this.props.current,
      shown: true,
    };

    this.animation = new Animated.Value(0);
    this.tickerAnimation = new Animated.Value(0);

    let l = props.tabs.length;
    let input = Array.from({ length: l }, (_, i) => i);
    let output = Array.from(
      { length: l },
      (_, i) => (i / l) * screenWidth + screenWidth / (2 * l) - tickerLength / 2
    );
    this.tickerLocation = this.tickerAnimation.interpolate({
      inputRange: input,
      outputRange: output,
    });
    this.tickerColor = this.tickerAnimation.interpolate({
      inputRange: input,
      outputRange: [colors.votingBackgroundColor, '#9c27b0', 'black'],
    });
    this.bottomVal = this.animation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '-20%'],
    });
  }

  // hide tab bar
  hide = () => {
    Animated.spring(this.animation, {
      toValue: 1,
      bounciness: 0,
      speed: 2,
      useNativeDriver: false,
    }).start(() => {
      this.setState({ shown: false });
    });
  };

  // show tab bar
  show = () => {
    Animated.spring(this.animation, {
      toValue: 0,
      bounciness: 5,
      useNativeDriver: false,
    }).start(() => {
      this.setState({ shown: true });
    });
  };

  componentDidUpdate() {
    if (this.props.show && !this.state.shown) {
      this.show();
    } else if (!this.props.show && this.state.shown) {
      this.hide();
    }
  }

  render() {
    return (
      <BlurView style={[styles.container]} blurType={'materialLight'}>
        <Animated.View
          style={[
            styles.ticker,
            {
              transform: [{ translateX: this.tickerLocation }],
              backgroundColor: this.tickerColor,
            },
          ]}
        />
        <SafeAreaView style={{ flexDirection: 'row' }} edges={['bottom']}>
          {this.props.tabs.map((val, index) => {
            const { icon, label, tkey, width, color, textColor } = val;
            return (
              <TabBarItem
                key={tkey}
                icon={icon}
                tkey={tkey}
                active={this.state.active == tkey}
                onPress={() => {
                  console.log(index);
                  this.setState({ active: tkey });
                  this.props.tabPressed(tkey);

                  // start animation
                  let multiplier = index;
                  Animated.spring(this.tickerAnimation, {
                    toValue: multiplier,
                    useNativeDriver: false,
                  }).start();
                }}
                width={width}
                color={color || colors.votingBackgroundColor}
                textColor={textColor || colors.tabs.bills.text}
                label={label}
              />
            );
          })}
        </SafeAreaView>
      </BlurView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignSelf: 'center',
    shadowRadius: 0,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    position: 'absolute',
    alignItems: 'center',
    maxHeight: Dimensions.get('screen').height * 0.11,
    bottom: 0,
  },
  ticker: {
    height: 4,
    width: tickerLength,
    position: 'absolute',
    top: 0,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
});

export default TabBar;
