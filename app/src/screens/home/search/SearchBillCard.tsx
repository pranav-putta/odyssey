import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Bill } from '../../../models/Bill';
import FastImage from 'react-native-fast-image';
import * as Animatable from 'react-native-animatable';
import { Config } from '../../../util/Config';

type Props = {
  bill: Bill;
  onPress: () => void;
};

type State = {};

export default class SearchBillCard extends React.PureComponent<Props, State> {
  render() {
    let topic = Config.getSmallTopics()[this.props.bill.category];
    if (!topic) {
      console.log("search screen")
      Config.alertUpdateConfig().then(() => {
        this.forceUpdate();
      });
    }
    return (
      <Animatable.View animation="fadeIn" style={styles.container}>
        <TouchableOpacity
          style={styles.innerContainer}
          onPress={this.props.onPress}
        >
          <View
            style={[
              styles.imageContainer,
              { backgroundColor: topic.color, padding: 10 },
            ]}
          >
            <FastImage style={styles.image} source={{ uri: topic.image }} />
          </View>
          <View style={{ marginLeft: '5%', width: '100%' }}>
            <Text style={{ fontWeight: '700', fontFamily: 'Futura' }}>
              {this.props.bill.title}
            </Text>
            <Text ellipsizeMode={'tail'} numberOfLines={2}>
              {this.props.bill.short_summary.trim()}
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
    left: 0,
  },
  innerContainer: {
    flex: 1,
    marginHorizontal: '5%',
    flexDirection: 'row',
    left: 0,
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: 10,
    overflow: 'hidden',
  },
  image: { flex: 1 },
});
