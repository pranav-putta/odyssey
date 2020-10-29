import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  Share,
} from 'react-native';
import { colors } from '../../../assets';
import FastImage from 'react-native-fast-image';
import { Bill, formatBillNumber } from '../../../models/Bill';
import { Category, DefaultCategory } from '../../../models/Category';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { SharedElement } from 'react-navigation-shared-element';
import { Config } from '../../../util/Config';
import ProgressHUD from '../../../components/ProgressHUD';

type State = {};

type Props = {
  bill: Bill;
  category: Category;
  index: number;
  scrollX: any;
  onPress: (
    imageRef: React.RefObject<View>,
    containerRef: React.RefObject<any>,
    contentRef: React.RefObject<any>
  ) => void;
};

const screenWidth = Dimensions.get('screen').width;

export const BillCardSpecs = {
  width: screenWidth * 0.8,
  height: '100%',
  externalRadius: 35,
  internalRadius: 25,
  spacing: 10,
};

export default class BillCard extends React.PureComponent<Props, State> {
  private imageRef = React.createRef<View>();
  private containerRef = React.createRef<any>();
  private contentRef = React.createRef<any>();

  render() {
    let { bill, index, scrollX, onPress } = this.props;
    let category = Config.getTopics()[bill.category];
    if (!category) {
      category = DefaultCategory;
      Config.alertUpdateConfig();
    }
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
    return (
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: category.bgColor,
          },
        ]}
        ref={this.containerRef}
      >
        <TouchableOpacity
          onPress={() =>
            onPress(this.imageRef, this.containerRef, this.contentRef)
          }
          activeOpacity={1}
          style={{ width: '100%', height: '100%' }}
        >
          <SharedElement
            id={`bill.${bill.number}.photo`}
            style={styles.imageContainer}
          >
            <FastImage style={styles.image} source={{ uri: category.image }} />
          </SharedElement>
          <Animated.View
            ref={this.contentRef}
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
            <View style={{ flex: 1 }}>
              <View style={styles.categoriesContainer}>
                <Text style={styles.number}>{formatBillNumber(bill)}</Text>

                <SharedElement
                  id={`bill.${bill.number}.category`}
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
                </SharedElement>
              </View>
              <Text
                style={styles.title}
                numberOfLines={2}
                adjustsFontSizeToFit={true}
              >
                {bill.title}
              </Text>
              <Text ellipsizeMode="tail" style={styles.synopsis}>
                {bill.short_summary}
              </Text>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    );
  }
}

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
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
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
    fontFamily: 'Futura',
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
