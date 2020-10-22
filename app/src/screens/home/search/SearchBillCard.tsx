import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Bill } from '../../../models/Bill';
import Global from '../../../util/global';
import FastImage from 'react-native-fast-image';

type Props = {
  bill: Bill;
  onPress: () => void;
};

type State = {};

export default class SearchBillCard extends React.PureComponent<Props, State> {
  render() {
    const topic = Global.getTopics()[this.props.bill.category];
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.innerContainer}
          onPress={this.props.onPress}
        >
          <View
            style={[styles.imageContainer, { backgroundColor: topic.color }]}
          >
            <FastImage style={styles.image} source={{ uri: topic.image }} />
          </View>
          <View style={{ marginLeft: '5%' }}>
            <Text style={{ fontWeight: '700', fontFamily: 'Futura' }}>
              {this.props.bill.title}
            </Text>
            <Text ellipsizeMode={'tail'} numberOfLines={2}>
              {this.props.bill.short_summary}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    margin: '0%',
    backgroundColor: 'white',
    alignItems: 'center',
    paddingHorizontal: '10%',
    paddingVertical: '2%',
  },
  innerContainer: {
    flex: 1,
    marginHorizontal: '5%',
    flexDirection: 'row',
  },
  imageContainer: {
    width: 60,
    height: 60,
    padding: 10,
    shadowColor: 'black',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    borderRadius: 10,
  },
  image: { flex: 1 },
});
