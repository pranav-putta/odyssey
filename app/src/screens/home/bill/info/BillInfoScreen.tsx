import React from 'react';
import {
  Animated,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Icon } from 'react-native-elements';
import { colors } from '../../../../assets';
import { Bill } from '../../../../models/Bill';
import { Category } from '../../../../models/Category';
import TouchableScale from 'react-native-touchable-scale';

interface Props {
  category: Category;
  item: Bill;
  borderRadius: Animated.AnimatedInterpolation;
  contentMargin: Animated.AnimatedInterpolation;
  collapse: () => void;
}

type State = {
  expanded: boolean;
  animation: Animated.Value;
  numberLines: number | undefined;
};

export default class BillInfoScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      expanded: false,
      animation: new Animated.Value(0),
      numberLines: 5,
    };
  }

  formatBillNumber = (item: Bill) => {
    let num = item.number.toString();
    while (num.length < 4) num = '0' + num;
    return item.chamber == 'house' ? 'HB' : 'SB' + num;
  };

  render() {
    let item = this.props.item;
    let category = this.props.category;
    return (
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: this.props.category.bgColor,
          borderRadius: this.props.borderRadius,
        }}
      >
        <Animated.View
          style={[styles.voteButton, { opacity: this.state.animation }]}
        >
          <TouchableScale
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
            onPress={() => {}}
          >
            <Text style={styles.voteText}>Vote!</Text>
          </TouchableScale>
        </Animated.View>
        <Animated.View
          style={[
            styles.imageContainer,
            {
              borderTopLeftRadius: this.props.borderRadius,
              borderTopRightRadius: this.props.borderRadius,
            },
          ]}
        >
          <Image style={styles.image} source={{ uri: category.image }} />
        </Animated.View>
        <Animated.View
          style={[
            styles.content,
            {
              margin: this.props.contentMargin,
              borderBottomRightRadius: this.props.borderRadius,
              borderBottomLeftRadius: this.props.borderRadius,
            },
          ]}
        >
          <View style={styles.categoriesContainer}>
            <Text style={styles.number}>
              {this.formatBillNumber(this.props.item)}
            </Text>
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
                {item.category}
              </Text>
            </View>
          </View>
          <Text style={styles.title}>{item.title}</Text>
          <ScrollView>
            <Text ellipsizeMode="tail" style={styles.synopsis}>
              {item.short_summary}
            </Text>
          </ScrollView>
        </Animated.View>
        {this.closeButton()}
      </Animated.View>
    );
  }

  // generate the close button
  closeButton = () => {
    return (
      <Animated.View
        style={[styles.closeButton, { opacity: this.state.animation }]}
      >
        <TouchableOpacity
          style={styles.backButtonTouchable}
          onPress={() => {
            this.props.collapse();
          }}
        >
          <Icon size={26} name="close" type="evilicon" color="black" />
        </TouchableOpacity>
      </Animated.View>
    );
  };
}

const styles = StyleSheet.create({
  container: {
    width: '78.2%',
    height: '46%',
    marginTop: '89%',
    alignSelf: 'center',
    borderRadius: 40,
    backgroundColor: colors.cards.temp,
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
  },
  content: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingVertical: '5%',
    paddingBottom: '2%',
    paddingHorizontal: '7.5%',
    flex: 2,
    shadowColor: 'black',
    shadowOpacity: 0.5,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 2.5 },
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
    backgroundColor: colors.finishButtonIconColor,
    justifyContent: 'center',
    alignItems: 'center',
    padding: '2%',
    paddingHorizontal: '4%',
    borderRadius: 20,
  },
  categoryText: { color: 'white', fontWeight: 'bold' },
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
  closeButton: {
    position: 'absolute',
    width: 40,
    height: 40,
    right: '6%',
    top: '6%',
    zIndex: 100,
    backgroundColor: colors.textInputBackground,
    borderRadius: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    marginHorizontal: 20,
  },
  backButtonTouchable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  voteButton: {
    position: 'absolute',
    right: '7%',
    bottom: '3%',
    padding: '4%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: colors.votingBackgroundColor,
    shadowColor: 'black',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    zIndex: 150,
  },
  voteText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
});
