import React from 'react';
import {
  StyleSheet,
  View,
  Image,
  Text,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {colors} from '../../../assets';
import {globalStyles} from '../../../assets/';
import * as Animatable from 'react-native-animatable';
import BillSmallCard from './BillSmallCard';
import BillItem from './BillItem';

import Carousel from 'react-native-snap-carousel';
import {SafeAreaView} from 'react-native-safe-area-context';

type State = {
  data: BillItem[];
  search: string;
};

type Props = {};

const width = Dimensions.get('screen').width;
const height = Dimensions.get('screen').height;

class FeedScreen extends React.Component<Props, State> {
  AnimatableImage: Animatable.AnimatableComponent<any, any>;
  billsRef = React.createRef<Carousel<Text>>();

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
          id: 'SB0010',
          title: 'PARAPROFESSIONAL EDUCATOR',
          category: 'Education',
          description: `Provides that in fixing the salaries of teachers, a school board shall pay those who serve on a full-time basis a rate not less than (i) $32,076 for the...`,
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
        <SafeAreaView />
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: '10%',
            zIndex: 1,
          }}>
          <Image
            source={require('../../../assets/images/dominoes.png')}
            style={styles.logoImage}
          />
          <Text style={styles.dominoText}>Bills</Text>
        </View>
        <View style={{flexDirection: 'row', zIndex: 1}}>
          <TouchableOpacity style={styles.tabButton}>
            <Text style={[styles.tabButton, {color: colors.primary}]}>New</Text>
          </TouchableOpacity>
          <Text style={styles.tabButton}>Liked</Text>
        </View>
        <Carousel
          data={this.state.data}
          renderItem={BillSmallCard}
          sliderWidth={width}
          itemWidth={width * 0.75}
          itemHeight={height}
          layout={'default'}
          autoplay={true}
          autoplayInterval={8000}
          inactiveSlideOpacity={0.5}
          loop={false}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    zIndex: 0,
  },
  logoImage: {
    height: '2%',
    width: '2%',
    marginLeft: '6%',
    resizeMode: 'center',
    borderRadius: 20,
    padding: '10%',
    zIndex: 2,
  },
  dominoText: {
    ...globalStyles.hugeText,
    marginLeft: '5%',
    textAlign: 'justify',
  },
  textInput: {
    backgroundColor: colors.textInputBackground,
    marginHorizontal: '10%',
    marginVertical: '2.5%',
    paddingHorizontal: '5%',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
  },
  tabButton: {
    fontSize: 20,
    marginLeft: '7%',
    marginBottom: '5%',
  },
});

export default FeedScreen;
