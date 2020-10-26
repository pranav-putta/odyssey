import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Bill } from '../../../models/Bill';
import Global from '../../../util/global';
import FastImage from 'react-native-fast-image';
import * as Animatable from 'react-native-animatable';

type Props = {
  bill: Bill;
  onPress: () => void;
};

type State = {};

export default class SearchBillCard extends React.PureComponent<Props, State> {
  render() {
    const topic = Global.getCategories()[this.props.bill.category];
    return (
      <Animatable.View animation="fadeIn" style={styles.container}>
        <TouchableOpacity
          style={styles.innerContainer}
          onPress={this.props.onPress}
        >
          <View style={[styles.imageContainer]}>
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
      </Animatable.View>
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
    borderRadius: 10,
    overflow: 'hidden',
  },
  image: { flex: 1 },
});
