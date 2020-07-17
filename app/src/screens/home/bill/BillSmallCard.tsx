import React from 'react';
import {View, Text, StyleSheet, Alert} from 'react-native';
import {colors} from '../../../assets';
import {Image} from 'react-native-animatable';
import {
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native-gesture-handler';
import BillItem from './BillItem';

type State = {};

type Props = {
  index: number;
  item: BillItem;
};

const BillSmallCard = (item: Props) => {
  return (
    <TouchableWithoutFeedback
      style={styles.container}
      onPress={() => {
        Alert.alert('hello');
      }}>
      <View style={{flex: 1}}>
        <Image
          style={styles.image}
          source={require('../../../assets/images/card-temp.jpg')}
        />
        <View style={styles.content}>
          <View style={styles.categoriesContainer}>
            <Text style={styles.number}>{item.item.id}</Text>

            <View style={styles.category}>
              <Text style={styles.categoryText}>{item.item.category}</Text>
            </View>
          </View>
          <Text style={styles.title}>{item.item.title}</Text>
          <Text style={styles.header}>Synposis</Text>
          <Text style={styles.synopsis}>{item.item.description}</Text>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '70%',
    height: '97%',
    backgroundColor: 'white',
    marginHorizontal: '10%',
    borderRadius: 20,
  },
  image: {
    width: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flex: 3,
  },
  content: {
    paddingVertical: '5%',
    paddingHorizontal: '7.5%',
    flex: 4,
  },
  number: {
    fontWeight: 'bold',
    color: colors.darkGray,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: '5%',
  },
  categoriesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  category: {
    backgroundColor: colors.finishButtonIconColor,
    justifyContent: 'center',
    alignItems: 'center',
    padding: '2%',
    borderRadius: 20,
  },
  categoryText: {color: 'white', fontWeight: 'bold'},
  header: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: '10%',
  },
  synopsis: {
    marginTop: '1.25%',
    fontWeight: '400',
  },
});

export default BillSmallCard;
