import React from 'react';
import {View, StyleSheet} from 'react-native';

class FloatingTabBar extends React.Component {
  render() {
    return <View style={styles.container}></View>;
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '80%',
  },
});

export default FloatingTabBar;
