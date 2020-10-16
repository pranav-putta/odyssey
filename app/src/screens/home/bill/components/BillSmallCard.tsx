import React, { createRef } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { colors } from '../../../../assets';
import { Image } from 'react-native-animatable';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import BillItem from './BillItem';
import { SharedElement } from 'react-navigation-shared-element';
import TouchableScale from 'react-native-touchable-scale';
import { Measure } from '../BillDetailScreen';
import { Icon } from 'react-native-elements';
import { Bill } from '../../../../models/Bill';
import { Category } from '../../../../models/Category';
type State = {};

type Props = {
  index: number;
  item: Bill;
  category: Category;
  onPress: (
    item: Bill,
    index: number,
    measure: Measure,
    category: Category
  ) => void;
};

const BillSmallCard = (item: Props) => {
  let ref = createRef<View>();

  let formatBillNumber = () => {
    let num = item.item.number.toString();
    while (num.length < 4) num = '0' + num;
    return item.item.chamber == 'house' ? 'HB' : 'SB' + num;
  };

  return (
    <View style={[styles.container]} ref={ref}>
      <TouchableWithoutFeedback
        style={[
          styles.touchableContainer,
          { backgroundColor: item.category.bgColor },
        ]}
        onPress={() => {
          ref.current?.measureInWindow((x, y, w, h) => {
            item.onPress(
              item.item,
              item.index,
              {
                x: x,
                y: y,
                width: w,
                height: h,
              },
              item.category
            );
          });
        }}
      >
        <SharedElement
          style={styles.imageContainer}
          id={`item.${item.item.number}.photo`}
        >
          <Image style={styles.image} source={{ uri: item.category.image }} />
        </SharedElement>
        <View style={styles.content}>
          <View style={styles.categoriesContainer}>
            <Text style={styles.number}>{formatBillNumber()}</Text>

            <View
              style={[
                styles.category,
                { backgroundColor: item.category.categoryColor },
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  { color: item.category.categoryTextColor },
                ]}
              >
                {item.item.category}
              </Text>
            </View>
          </View>
          <Text style={styles.title}>{item.item.title}</Text>
          <Text ellipsizeMode="tail" style={styles.synopsis}>
            {item.item.short_summary}
          </Text>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};

const borderRadius = 40;
const contentBorderRadius = 30;

const styles = StyleSheet.create({
  container: {
    width: '98%',
    height: '85%',
    marginTop: '5%',
    alignSelf: 'center',
  },
  touchableContainer: {
    width: '100%',
    height: '100%',
    alignSelf: 'center',
    borderRadius: borderRadius,
    shadowColor: 'black',
    shadowOpacity: 0,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 4 },
  },
  imageContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  image: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    resizeMode: 'cover',
  },
  content: {
    margin: '5%',
    backgroundColor: 'white',
    borderRadius: contentBorderRadius,
    paddingVertical: '5%',
    paddingHorizontal: '7.5%',
    flex: 2,
    shadowColor: 'black',
    shadowOpacity: 0.5,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 0 },
  },
  number: {
    fontFamily: 'Roboto-Light',
    fontWeight: '400',
    fontSize: 16,
    color: colors.blueGray,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Futura-CondensedLight',
    fontWeight: '700',
    marginTop: '5%',
  },
  categoriesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  category: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: '2%',
    paddingHorizontal: '4%',
    borderRadius: 20,
  },
  categoryText: {
    fontFamily: 'Roboto-Thin',
    fontWeight: '800',
  },
  header: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: '10%',
  },
  synopsis: {
    flex: 1,
    flexWrap: 'wrap',
    textAlignVertical: 'center',
    marginTop: '5%',
    fontSize: 15,
    fontWeight: '200',
    fontFamily: 'Futura',
  },
  heartButton: {
    position: 'absolute',
    margin: '5%',
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 40,
  },
  heartButtonIcon: {},
});

export default BillSmallCard;
