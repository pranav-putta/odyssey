import React from 'react';
import {StyleSheet, View, Text, StyleProp, ViewStyle} from 'react-native';
import {
  TouchableWithoutFeedback,
  TouchableHighlight,
  TouchableOpacity,
} from 'react-native-gesture-handler';
import {Icon} from 'react-native-elements';
import {colors} from '../assets/';

class TabBar extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <TabItem
          icon={{name: 'fire', type: 'font-awesome-5'}}
          active={true}
          label="Feed"
        />
      </View>
    );
  }
}

type TabItemProps = {
  style?: StyleProp<ViewStyle>;
  icon: {
    type: string;
    name: string;
  };
  label: string;
  active: boolean;
};

const activeColor = 'rgb(30, 30, 110)';
const inactiveColor = 'rgba(30, 30, 110, 0.4)';

const TabItem: React.FC<TabItemProps> = ({style, icon, label, active}) => {
  return (
    <TouchableWithoutFeedback>
      <View style={[tabItemStyles.container, style]}>
        {active && (
          <View style={tabItemStyles.centered}>
            <Text style={tabItemStyles.label}>{label}</Text>
          </View>
        )}
        {!active && (
          <View style={tabItemStyles.centered}>
            <Icon name={icon.name} type={icon.type} />
          </View>
        )}
        {active && <View style={tabItemStyles.dot} />}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '90%',
    height: '7.5%',
    bottom: '2.5%',
    margin: '5%',
    shadowColor: 'gray',
    shadowOffset: {width: 10, height: 10},
    shadowOpacity: 0.2,
    shadowRadius: 10,
    borderRadius: 10,
    backgroundColor: 'white',
    flexDirection: 'row',
    paddingHorizontal: '5%',
  },
});

const tabItemStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centered: {},
  icon: {
    tintColor: inactiveColor,
  },
  label: {
    color: activeColor,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  dot: {
    bottom: 8,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: activeColor,
  },
});

export default TabBar;
