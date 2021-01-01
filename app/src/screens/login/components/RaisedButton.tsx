import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Icon } from 'react-native-elements';
import {
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native-gesture-handler';
import tinycolor from 'tinycolor2';

const height = 60;
const elevation = 0;

function RaisedButton(props: {
  label: string;
  color: string;
  styles?: StyleProp<ViewStyle>;
  icon?: { name: string; type: string };
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: props.color,
        },
        props.styles,
      ]}
      onPress={props.onPress}
    >
      {props.icon ? (
        <Icon
          size={28}
          name={props.icon.name}
          type={props.icon.type}
          color={'white'}
        />
      ) : null}

      <View style={{ width: 10 }} />
      <Text style={styles.buttonText}>{props.label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    shadowOpacity: 1,
    shadowOffset: { height: elevation, width: 0 },
    shadowRadius: 0,
    flexDirection: 'row',
  },
  buttonText: {
    color: 'white',
    fontFamily: 'Futura',
    fontSize: 20,
    fontWeight: '500',
  },
});

export default RaisedButton;
