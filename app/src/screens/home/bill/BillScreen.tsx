import React from 'react';
import {
  StyleSheet,
  View,
  Image,
  StatusBar,
  TextInput,
  Dimensions,
  Animated,
} from 'react-native';
import {colors} from '../../../assets';
import {globalStyles} from '../../../assets/';
import * as Animatable from 'react-native-animatable';
import BillSmallCard from './BillSmallCard';
import BillItem from './BillItem';

import Carousel from 'react-native-snap-carousel';

type State = {
  data: BillItem[];
  search: string;
};

type Props = {};

const width = Dimensions.get('screen').width;
const height = Dimensions.get('screen').height;

class FeedScreen extends React.Component<Props, State> {
  AnimatableImage: Animatable.AnimatableComponent<any, any>;

  constructor(props: any) {
    super(props);

    this.state = {
      data: [
        {
          id: 'HB0018',
          title: 'SCH CD-CHARACTER EDUCATION',
          category: 'Environment',
          description: `Amends the School Code. Requires the instruction on character education to include the teaching of respect toward a person's race or ethnicity or gender.`,
        },
        {
          id: 'SB0018',
          title: 'NEW SCHOOL',
          category: 'Education',
          description: `Amends the School Code. Requires the instruction on character education to include the teaching of respect toward a person's race or ethnicity or gender.`,
        },
      ],
      search: '',
    };

    // create components
    this.AnimatableImage = Animatable.createAnimatableComponent(Image);
  }

  render() {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <this.AnimatableImage
          animation="lightSpeedIn"
          duration={500}
          iterationCount={1}
          source={require('../../../assets/images/dominoes.png')}
          style={styles.logoImage}
        />
        <Animatable.Text
          animation="bounceIn"
          duration={1500}
          iterationCount={1}
          style={styles.dominoText}>
          Bills
        </Animatable.Text>
        <Animated.View style={styles.textInput}>
          <TextInput
            style={{fontSize: 18}}
            value={this.state.search}
            onChangeText={(text) => {
              this.setState({search: text});
            }}
            keyboardType="name-phone-pad"
            placeholder="Search"
          />
        </Animated.View>
        <Carousel
          data={this.state.data}
          renderItem={BillSmallCard}
          sliderWidth={width}
          itemWidth={width}
          itemHeight={height}
          layout={'stack'}
          layoutCardOffset={20}
          autoplay={true}
          autoplayInterval={8000}
          loop={true}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  logoImage: {
    height: '2%',
    width: '2%',
    marginTop: '25%',
    marginLeft: '10%',
    resizeMode: 'center',
    borderRadius: 20,
    padding: '10%',
  },
  dominoText: {
    ...globalStyles.hugeText,
    marginLeft: '10%',
    marginTop: '2.5%',
    color: colors.dominoTextColor,
  },
  viewPager: {marginLeft: '10%', marginTop: '10%'},
  textInput: {
    backgroundColor: colors.textInputBackground,
    marginHorizontal: '10%',
    marginVertical: '5%',
    paddingHorizontal: '5%',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
  },
});

export default FeedScreen;
