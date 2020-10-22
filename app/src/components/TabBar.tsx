import React from 'react';
import { StyleSheet, Alert, Animated } from 'react-native';
import TabBarItem from './TabBarItem';
import { colors } from '../assets';
import { StackNavigationProp } from '@react-navigation/stack';
import { TabNavigationState } from '@react-navigation/native';

// key enum for each tab
export enum TabKey {
  bills = 'bills',
  search = 'search',
  profile = 'profile',
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

class TabBar extends React.Component<Props, State> {
  bottomVal: Animated.AnimatedInterpolation;
  animation: Animated.Value;

  constructor(props: Props) {
    super(props);

    this.state = {
      active: this.props.current,
      shown: true,
    };

    this.animation = new Animated.Value(0);
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
      <Animated.View
        style={[
          styles.container,
          { zIndex: this.props.zIndex || 1, bottom: this.bottomVal },
        ]}
      >
        {this.props.tabs.map((val, index) => {
          const { icon, label, tkey, width, color, textColor } = val;
          return (
            <TabBarItem
              key={tkey}
              icon={icon}
              tkey={tkey}
              active={this.state.active == tkey}
              onPress={(key: string) => {
                this.setState({ active: key });
                this.props.tabPressed(key);
              }}
              width={width}
              color={color || colors.tabs.bills.color}
              textColor={textColor || colors.tabs.bills.text}
              label={label}
            />
          );
        })}
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '8.5%',
    alignSelf: 'center',
    shadowColor: 'gray',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0,
    shadowRadius: 5,
    paddingTop: '1%',
    paddingBottom: '2%',
    //borderRadius: 10,
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    position: 'absolute',
    alignItems: 'flex-start',
  },
});

export default TabBar;
