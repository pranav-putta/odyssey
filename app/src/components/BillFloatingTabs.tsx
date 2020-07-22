import React from 'react';
import {Animated, StyleSheet} from 'react-native';
import TabBarItem from './TabBarItem';
import {colors} from '../assets/';

export enum BillFloatingTabKey {
  info = 'info',
  voting = 'voting',
  research = 'research',
}

type State = {
  active: string;
};

type Props = {
  current: string;
  opacity: Animated.AnimatedInterpolation;
  itemColor: string;
  itemTextColor: string;
  onTabPress: (key: string) => void;
};

class BillFloatingTabs extends React.Component<Props, State> {
  onTabPress = (key: string) => {
    this.setState({active: key});
    this.props.onTabPress(key);
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      active: this.props.current,
    };
  }

  render() {
    if (this.props.current != this.state.active) {
      this.onTabPress(this.props.current);
    }
    return (
      <Animated.View style={[styles.container, {opacity: this.props.opacity}]}>
        <TabBarItem
          icon={{name: 'info', type: 'feather'}}
          tkey={BillFloatingTabKey.info}
          active={this.state.active}
          onPress={this.onTabPress}
          width={50}
          color={this.props.itemColor}
          textColor={this.props.itemTextColor}
          label="Info"
        />
        <TabBarItem
          icon={{name: 'vote', type: 'material-community'}}
          tkey={BillFloatingTabKey.voting}
          active={this.state.active}
          onPress={this.onTabPress}
          width={70}
          color={this.props.itemColor}
          textColor={this.props.itemTextColor}
          label="Voting"
        />
        <TabBarItem
          icon={{name: 'book-open', type: 'feather'}}
          tkey={BillFloatingTabKey.research}
          active={this.state.active}
          onPress={this.onTabPress}
          width={70}
          color={this.props.itemColor}
          textColor={this.props.itemTextColor}
          label="Research"
        />
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '90%',
    height: '7%',
    bottom: '5%',
    zIndex: 100,
    alignSelf: 'center',
    shadowColor: 'gray',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.3,
    shadowRadius: 5,
    borderRadius: 40,
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
});

export default BillFloatingTabs;
