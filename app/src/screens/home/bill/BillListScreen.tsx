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
import {globalStyles} from '../../../assets';
import * as Animatable from 'react-native-animatable';
import BillSmallCard from './components/BillSmallCard';
import BillItem from './components/BillItem';
import Carousel from 'react-native-snap-carousel';
import {SafeAreaView} from 'react-native-safe-area-context';
import {StackNavigationProp} from '@react-navigation/stack';
import BillDetailScreen, {Measure} from './BillModal';

type State = {
  data: BillItem[];
  search: string;
  selectedBill: BillItem | undefined;
  billMeasure: Measure | undefined;
  showDetails: boolean;
};

type Props = {
  toggleTabs: () => void;
};

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
          id: 'SB0027',
          title: 'INS CODE/PUBLIC AID-TELEHEALTH',
          category: 'Insurance',
          description: `Amends the Illinois Insurance Code. In provisions concerning coverage for telehealth services, provides that certain health benefit policies or plans may not exclude from coverage a medically necessary health care service or procedure delivered by certain providers solely because the health care service or procedure is provided through telehealth (rather than requiring certain policies to meet specified criteria if they provide coverage for telehealth services). Provides the requirements of coverage for telehealth services. Provides that an individual or group policy of accident or health insurance that provides coverage for telehealth services delivered by contracted licensed dietitian nutritionists and contracted certified diabetes educators must also provide coverage for in-home services for senior diabetes patients (rather than requiring an individual or group policy of accident or health insurance that provides coverage for telehealth services to provide coverage for licensed dietitian nutritionists and certified diabetes educators who counsel senior diabetes patients in the patients' homes). Amends the Illinois Public Aid Code. Provides payment, reimbursement, and service requirements for telehealth services provided under the State's fee-for-service or managed care medical assistance programs. Provides that "telehealth" includes telepsychiatry. Provides that the Department of Healthcare and Family Services shall implement the new provisions 60 days after the effective date of the amendatory Act. Repeals a provision requiring the Department to reimburse psychiatrists and federally qualified health centers for mental health services provided by psychiatrists to medical assistance recipients through telepsychiatry. Makes other changes.`,
        },
        {
          id: 'SB0022',
          title: 'VEH CD-DEALER CAR SALES',
          category: 'Transportation',
          description: `Amends the Illinois Vehicle Code. Provides that the Act may be referred to as the Religious Equity Act. Allows for the sale of motor vehicles on any 6 days of the week chosen by the business owner (instead of on any day but Sunday). Makes conforming changes. Effective immediately.`,
        },
      ],
      search: '',
      selectedBill: undefined,
      billMeasure: undefined,
      showDetails: false,
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
        <View style={{flexDirection: 'row', zIndex: 1, marginLeft: '10%'}}>
          <TouchableOpacity style={styles.tabButton}>
            <Text style={[styles.tabButton, {color: colors.primary}]}>New</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabButton}>
            <Text style={[styles.tabButton]}>Liked</Text>
          </TouchableOpacity>
        </View>
        <Carousel
          data={this.state.data}
          renderItem={(item: {item: BillItem; index: number}) => {
            return (
              <BillSmallCard
                index={item.index}
                item={item.item}
                onPress={(item: BillItem, index: number) => {
                  this.setState({selectedBill: item});

                  this.setState({showDetails: true});
                  this.props.toggleTabs();
                }}
              />
            );
          }}
          sliderWidth={width}
          itemWidth={width * 0.75}
          itemHeight={height}
          layout={'default'}
          autoplay={true}
          autoplayInterval={8000}
          inactiveSlideOpacity={0.5}
          loop={false}
        />
        <View
          style={[StyleSheet.absoluteFill, {zIndex: 100}]}
          pointerEvents={this.state.showDetails ? 'auto' : 'none'}>
          <BillDetailScreen
            item={this.state.selectedBill}
            measure={this.state.billMeasure}
            expanded={this.state.showDetails}
            onClose={() => {
              console.log('closed!');
              this.setState({showDetails: false});
              this.setState({selectedBill: undefined});
              this.setState({billMeasure: undefined});
              this.props.toggleTabs();
            }}
          />
        </View>
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
    marginHorizontal: '1%',
    marginBottom: '5%',
  },
});

export default FeedScreen;
