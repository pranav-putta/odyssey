import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import TabBarItem from './TabBarItem';
import { colors } from '../assets/';

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
  height: Animated.AnimatedInterpolation;
  opacity: Animated.AnimatedInterpolation;
  itemColor: string;
  itemTextColor: string;
  onTabPress: (key: string) => void;
};

class BillFloatingTabs extends React.Component<Props, State> {
  onTabPress = (key: string) => {
    this.setState({ active: key });
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
      <Animated.View
        style={[
          styles.container,
          { height: this.props.height, opacity: this.props.opacity },
        ]}
      >
        <View style={styles.tabContainer}>
          <TabBarItem
            icon={{ name: 'info', type: 'feather' }}
            tkey={BillFloatingTabKey.info}
            active={this.state.active}
            onPress={this.onTabPress}
            width={50}
            color={this.props.itemColor}
            textColor={this.props.itemTextColor}
            label="Info"
          />
          <TabBarItem
            icon={{ name: 'vote', type: 'material-community' }}
            tkey={BillFloatingTabKey.voting}
            active={this.state.active}
            onPress={this.onTabPress}
            width={70}
            color={this.props.itemColor}
            textColor={this.props.itemTextColor}
            label="Voting"
          />
          <TabBarItem
            icon={{ name: 'book-open', type: 'feather' }}
            tkey={BillFloatingTabKey.research}
            active={this.state.active}
            onPress={this.onTabPress}
            width={70}
            color={this.props.itemColor}
            textColor={this.props.itemTextColor}
            label="Research"
          />
        </View>
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    //width: '90%',
    width: '100%',
    height: '8%',
    bottom: '0%',
    zIndex: 100,
    alignSelf: 'center',
    shadowColor: 'gray',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    backgroundColor: 'white',
  },
  tabContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignContent: 'center',
    marginBottom: '1.5%',
  },
});

export default BillFloatingTabs;
