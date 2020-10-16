import React, { createRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Dimensions,
  Animated,
} from 'react-native';
import { colors } from '../../../../assets';
import { Image } from 'react-native-animatable';
import { Bill, formatBillNumber } from '../../../../models/Bill';
import { Category } from '../../../../models/Category';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { SharedElement } from 'react-navigation-shared-element';
type State = {};

type Props = {
  bill: Bill;
  category: Category;
  index: number;
  scrollX: any;
  onPress: () => void;
};

const screenWidth = Dimensions.get('screen').width;
const screenHeight = Dimensions.get('screen').height;

export const BillCardSpecs = {
  width: screenWidth * 0.8,
  height: '100%',
  externalRadius: 35,
  internalRadius: 25,
  spacing: 10,
};

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(
  TouchableOpacity
);

const BillCard = (props: Props) => {
  const { bill, category, index, scrollX } = props;
  const { width, spacing } = BillCardSpecs;
  const fullSize = width + 2 * spacing;
  const extraPadding = -index * spacing * 2;
  const inputRange = [
    (index - 1) * fullSize + extraPadding,
    index * fullSize + extraPadding,
    (index + 1) * fullSize + extraPadding,
  ];
  const translateX = scrollX.interpolate({
    inputRange: inputRange,
    outputRange: [width / 1.5, 0, -width / 1.5],
  });
  const contentShadowOpacity = scrollX.interpolate({
    inputRange: inputRange,
    outputRange: [0, 0.5, 0],
  });
  const perspective = scrollX.interpolate({
    inputRange: inputRange,
    outputRange: [800, 0, -800],
  });
  const rotateY = scrollX.interpolate({
    inputRange: inputRange,
    outputRange: ['10deg', '0deg', '0deg'],
  });
  return (
    <AnimatedTouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: category.bgColor,
        },
      ]}
      onPress={props.onPress}
      activeOpacity={1}
    >
      <View style={styles.imageContainer}>
        <Image style={styles.image} source={{ uri: category.image }} />
      </View>
      <Animated.View
        style={[
          styles.content,
          {
            shadowOpacity: contentShadowOpacity,
            transform: [
              { translateX: translateX },
              //  { rotateY: rotateY },
            ],
          },
        ]}
      >
        <View style={styles.categoriesContainer}>
          <Text style={styles.number}>{formatBillNumber(bill)}</Text>

          <View
            style={[
              styles.category,
              { backgroundColor: category.categoryColor },
            ]}
          >
            <Text
              style={[
                styles.categoryText,
                { color: category.categoryTextColor },
              ]}
            >
              {bill.category}
            </Text>
          </View>
        </View>
        <Text style={styles.title}>{bill.title}</Text>
        <Text ellipsizeMode="tail" style={styles.synopsis}>
          {bill.short_summary}
        </Text>
      </Animated.View>
    </AnimatedTouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: BillCardSpecs.height,
    width: BillCardSpecs.width,
    borderRadius: BillCardSpecs.externalRadius,
    marginHorizontal: BillCardSpecs.spacing,
    alignSelf: 'center',
    overflow: 'hidden',
  },
  touchableContainer: {
    width: '100%',
    height: '100%',
    alignSelf: 'center',
    borderRadius: BillCardSpecs.externalRadius,
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
    resizeMode: 'cover',
    flex: 1,
  },
  content: {
    margin: '5%',
    backgroundColor: 'white',
    borderRadius: BillCardSpecs.internalRadius,
    paddingVertical: '5%',
    paddingHorizontal: '7.5%',
    flex: 2,
    shadowColor: 'black',
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 0 },
    zIndex: 100,
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

export default BillCard;
