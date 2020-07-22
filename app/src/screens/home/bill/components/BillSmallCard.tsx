import React, {createRef} from 'react';
import {View, Text, StyleSheet, Alert} from 'react-native';
import {colors} from '../../../../assets';
import {Image} from 'react-native-animatable';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import BillItem from './BillItem';
import {SharedElement} from 'react-navigation-shared-element';
import TouchableScale from 'react-native-touchable-scale';
import {Measure} from '../BillDetailScreen';
import {Icon} from 'react-native-elements';
type State = {};

type Props = {
  index: number;
  item: BillItem;
  onPress: (item: BillItem, index: number, measure: Measure) => void;
};

const BillSmallCard = (item: Props) => {
  let ref = createRef<View>();

  return (
    <View style={[styles.container]} ref={ref}>
      <TouchableWithoutFeedback
        style={[
          styles.touchableContainer,
          {backgroundColor: item.item.bgColor},
        ]}
        onPress={() => {
          ref.current?.measureInWindow((x, y, w, h) => {
            item.onPress(item.item, item.index, {
              x: x,
              y: y,
              width: w,
              height: h,
            });
          });
        }}>
        <SharedElement
          style={styles.imageContainer}
          id={`item.${item.item.id}.photo`}>
          <Image style={styles.image} source={item.item.image} />
        </SharedElement>
        <View style={styles.content}>
          <View style={styles.categoriesContainer}>
            <Text style={styles.number}>{item.item.id}</Text>

            <View
              style={[
                styles.category,
                {backgroundColor: item.item.categoryColor},
              ]}>
              <Text
                style={[
                  styles.categoryText,
                  {color: item.item.categoryTextColor},
                ]}>
                {item.item.category}
              </Text>
            </View>
          </View>
          <Text style={styles.title}>{item.item.title}</Text>
          <Text ellipsizeMode="tail" style={styles.synopsis}>
            {item.item.description}
          </Text>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '98%',
    height: '75%',
    marginTop: '5%',
    alignSelf: 'center',
  },
  touchableContainer: {
    width: '100%',
    height: '100%',
    alignSelf: 'center',
    borderRadius: 40,
    shadowColor: 'black',
    shadowOpacity: 0,
    shadowRadius: 5,
    shadowOffset: {width: 0, height: 4},
  },
  imageContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 4,
  },
  image: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  content: {
    margin: '5%',
    backgroundColor: 'white',
    borderRadius: 30,
    paddingVertical: '5%',
    paddingHorizontal: '7.5%',
    flex: 6,
    shadowColor: 'black',
    shadowOpacity: 0.5,
    shadowRadius: 15,
    shadowOffset: {width: 0, height: 0},
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
