import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Topic } from '../../../models/Topic';
import FastImage from 'react-native-fast-image';

type Props = {
  category: Topic;
  onPress: () => void;
};

type State = {};

export default class CategoryCard extends React.PureComponent<Props, State> {
  render() {
    return (
      <View
        style={{
          width: 110,
          height: 110,
          backgroundColor: this.props.category.color,
          margin: 5,
          borderRadius: 10,
          justifyContent: 'center',
          shadowColor: 'black',
          shadowOpacity: 0.1,
          shadowRadius: 5,
          shadowOffset: { height: 2, width: 0 },
        }}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            margin: '5%',
            borderRadius: 10,
            justifyContent: 'center',
            alignItems: 'center',
            borderColor: 'grey',
          }}
          onPress={this.props.onPress}
        >
          <FastImage
            style={{ height: 50, width: 50, marginBottom: 5 }}
            source={{ uri: this.props.category.image }}
          />
          <Text
            style={{
              bottom: 0,
              fontSize: 18,
              color: this.props.category.textColor,
              fontWeight: 'bold',
            }}
            numberOfLines={1}
            adjustsFontSizeToFit={true}
          >
            {this.props.category.name}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  iconContainer: {
    padding: '10%',
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: 'black',
    shadowOpacity: 0.5,
    shadowRadius: 15,
    shadowOffset: { height: 2, width: 0 },
  },
  icon: {
    width: 60,
    height: 60,
  },
  name: {},
});
