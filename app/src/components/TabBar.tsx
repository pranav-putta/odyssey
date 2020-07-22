import React from 'react';
import {StyleSheet, Alert, Animated} from 'react-native';
import TabBarItem from './TabBarItem';
import {colors} from '../assets';

type TabBarState = {
  active: string;
  animation: Animated.Value;
  shown: boolean;
};

type TabBarProps = {
  zIndex?: number;
  show: boolean;
  current: string;
  tabPressed: (tab: string) => void;
};

// key enum for each tab
export enum TabKey {
  bills = 'bills',
  community = 'community',
  profile = 'profile',
}

class TabBar extends React.Component<TabBarProps, TabBarState> {
  bottomVal: Animated.AnimatedInterpolation;

  constructor(props: TabBarProps) {
    super(props);

    this.state = {
      active: this.props.current,
      animation: new Animated.Value(0),
      shown: true,
    };

    this.bottomVal = this.state.animation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '-15%'],
    });
  }

  // hide tab bar
  hide = () => {
    Animated.spring(this.state.animation, {
      toValue: 1,
      bounciness: 0,
      speed: 1,
      useNativeDriver: false,
    }).start(() => {
      this.setState({shown: false});
    });
  };

  // show tab bar
  show = () => {
    Animated.spring(this.state.animation, {
      toValue: 0,
      bounciness: 5,
      useNativeDriver: false,
    }).start(() => {
      this.setState({shown: true});
    });
  };

  // called when tab item is pressed
  onTabPress = (key: string) => {
    this.setState({active: key});
    this.props.tabPressed(key);
  };

  render() {
    if (this.props.show && !this.state.shown) {
      this.show();
    } else if (!this.props.show && this.state.shown) {
      this.hide();
    }

    return (
      <Animated.View
        style={[
          styles.container,
          {zIndex: this.props.zIndex || 1, bottom: this.bottomVal},
        ]}>
        <TabBarItem
          icon={{name: 'trello', type: 'feather'}}
          tkey={TabKey.bills}
          active={this.state.active}
          onPress={this.onTabPress}
          width={40}
          color={colors.tabs.bills.color}
          textColor={colors.tabs.bills.text}
          label="Bills"
        />
        <TabBarItem
          icon={{name: 'earth-outline', type: 'ionicon'}}
          tkey={TabKey.community}
          active={this.state.active}
          onPress={this.onTabPress}
          width={90}
          color={colors.tabs.community.color}
          textColor={colors.tabs.community.text}
          label="Community"
        />
        <TabBarItem
          icon={{name: 'user', type: 'feather'}}
          tkey={TabKey.profile}
          active={this.state.active}
          onPress={this.onTabPress}
          width={50}
          color={colors.tabs.profile.color}
          textColor={colors.tabs.profile.text}
          label="Profile"
        />
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '100%',
    height: '11%',
    alignSelf: 'center',
    shadowColor: 'gray',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0,
    shadowRadius: 5,
    paddingBottom: '2%',
    //borderRadius: 10,
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
});

export default TabBar;
