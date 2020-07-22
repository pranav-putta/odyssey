import React from 'react';
import {
  StyleSheet,
  View,
  Image,
  Text,
  Dimensions,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {colors} from '../../../assets';
import {globalStyles} from '../../../assets';
import * as Animatable from 'react-native-animatable';
import BillSmallCard from './components/BillSmallCard';
import BillItem from './components/BillItem';
import Carousel from 'react-native-snap-carousel';
import {SafeAreaView} from 'react-native-safe-area-context';
import {StackNavigationProp} from '@react-navigation/stack';
import BillDetailScreen, {Measure} from './BillDetailScreen';
import TouchableScale from 'react-native-touchable-scale';
import {Icon} from 'react-native-elements';

enum BillTabKey {
  new = 'new',
  liked = 'liked',
}

type State = {
  data: BillItem[];
  search: string;
  selectedBill: BillItem | undefined;
  billMeasure: Measure | undefined;
  showDetails: boolean;
  currentTab: BillTabKey;
};

type Props = {
  toggleTabs: () => void;
  navigation: StackNavigationProp<any, any>;
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
          category: 'Education',
          description: `Amends the School Code. Requires the instruction on character education to include the teaching of respect toward a person's race or ethnicity or gender.`,
          bgColor: '#7fd6db',
          categoryColor: '#7fd6db50',
          categoryTextColor: '#7fd6db',
          image: require('../../../assets/images/finance.png'),
        },
        {
          id: 'SB0027',
          title: 'INS CODE/PUBLIC AID-TELEHEALTH',
          category: 'Insurance',
          description: `Amends the Illinois Insurance Code. In provisions concerning coverage for telehealth services, provides that certain health benefit policies or plans may not exclude from coverage a medically necessary health care service or procedure delivered by certain providers solely because the health care service or procedure is provided through telehealth (rather than requiring certain policies to meet specified criteria if they provide coverage for telehealth services). Provides the requirements of coverage for telehealth services. Provides that an individual or group policy of accident or health insurance that provides coverage for telehealth services delivered by contracted licensed dietitian nutritionists and contracted certified diabetes educators must also provide coverage for in-home services for senior diabetes patients (rather than requiring an individual or group policy of accident or health insurance that provides coverage for telehealth services to provide coverage for licensed dietitian nutritionists and certified diabetes educators who counsel senior diabetes patients in the patients' homes). Amends the Illinois Public Aid Code. Provides payment, reimbursement, and service requirements for telehealth services provided under the State's fee-for-service or managed care medical assistance programs. Provides that "telehealth" includes telepsychiatry. Provides that the Department of Healthcare and Family Services shall implement the new provisions 60 days after the effective date of the amendatory Act. Repeals a provision requiring the Department to reimburse psychiatrists and federally qualified health centers for mental health services provided by psychiatrists to medical assistance recipients through telepsychiatry. Makes other changes.`,
          bgColor: '#ecb3ea',
          categoryColor: '#ecb3ea50',
          categoryTextColor: '#ecb3ea',
          image: require('../../../assets/images/card.png'),
        },
        {
          id: 'SB0022',
          title: 'VEH CD-DEALER CAR SALES',
          category: 'Transportation',
          description: `Amends the Illinois Vehicle Code. Provides that the Act may be referred to as the Religious Equity Act. Allows for the sale of motor vehicles on any 6 days of the week chosen by the business owner (instead of on any day but Sunday). Makes conforming changes. Effective immediately.`,
          bgColor: '#68d678',
          categoryColor: '#68d67850',
          categoryTextColor: '#68d678',
          image: require('../../../assets/images/transport.png'),
        },
        {
          id: 'SB0022',
          title: 'VEH CD-DEALER CAR SALES',
          category: 'Transportation',
          description: `Amends the Illinois Vehicle Code. Provides that the Act may be referred to as the Religious Equity Act. Allows for the sale of motor vehicles on any 6 days of the week chosen by the business owner (instead of on any day but Sunday). Makes conforming changes. Effective immediately.`,
          bgColor: '#ffab40',
          categoryColor: '#ffab4050',
          categoryTextColor: '#ffab40',
          image: require('../../../assets/images/finance.png'),
        },
      ],
      search: '',
      selectedBill: undefined,
      billMeasure: undefined,
      showDetails: false,
      currentTab: BillTabKey.new,
    };

    // create components
    this.AnimatableImage = Animatable.createAnimatableComponent(Image);
  }

  tabItem = (label: string, key: BillTabKey) => {
    const active = key == this.state.currentTab;
    return (
      <TouchableScale
        style={styles.tabButton}
        disabled={active}
        onPress={() => {
          this.setState({currentTab: key});
        }}>
        <Text
          style={[styles.tabText, {color: active ? 'black' : colors.darkGray}]}>
          {label}
        </Text>
        <View
          style={[
            styles.tabDot,
            {
              opacity: active ? 1 : 0,
              backgroundColor: 'black',
            },
          ]}
        />
      </TouchableScale>
    );
  };

  tabs = () => {
    return (
      <View style={styles.topTabs}>
        {this.tabItem('New', BillTabKey.new)}
        {this.tabItem('Liked', BillTabKey.liked)}
      </View>
    );
  };

  newTab = () => {
    return (
      <Carousel
        data={this.state.data}
        renderItem={(item: {item: BillItem; index: number}) => {
          return (
            <BillSmallCard
              index={item.index}
              item={item.item}
              onPress={(item: BillItem, index: number, measure: Measure) => {
                this.setState({selectedBill: item});
                this.setState({billMeasure: measure});
                this.setState({showDetails: true});
                this.props.toggleTabs();
              }}
            />
          );
        }}
        sliderWidth={width}
        itemWidth={width * 0.8}
        itemHeight={height}
        layout={'default'}
        inactiveSlideScale={0.9}
        inactiveSlideOpacity={0.8}
        centerContent={true}
        loop={false}
      />
    );
  };

  likedTab = () => {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text style={{fontSize: 24, marginBottom: '50%'}}>No Likes Yet!</Text>
      </View>
    );
  };

  currentTab = () => {
    if (this.state.currentTab == BillTabKey.new) {
      return this.newTab();
    } else if (this.state.currentTab == BillTabKey.liked) {
      return this.likedTab();
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <SafeAreaView />
        <View
          style={{
            marginHorizontal: '8%',
            marginBottom: '4%',
            padding: '4%',
            borderRadius: 10,
          }}>
          <Text style={styles.discover}>Discover</Text>
          <Text style={styles.discoverCaption}>
            Explore the most important new bills being discussed in the Illinois
            Congress today.
          </Text>
        </View>
        {this.tabs()}
        {this.currentTab()}
        <View
          style={[StyleSheet.absoluteFill, {zIndex: 100}]}
          pointerEvents={this.state.showDetails ? 'auto' : 'none'}>
          <BillDetailScreen
            item={this.state.selectedBill}
            measure={this.state.billMeasure}
            expanded={this.state.showDetails}
            onClose={() => {
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
    backgroundColor: 'white',
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
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: '5%',
  },
  tabDot: {
    width: 6,
    height: 6,
    marginVertical: '10%',
    backgroundColor: 'black',
    borderRadius: 30,
  },
  tabText: {
    fontSize: 22,
  },
  topTabs: {
    flexDirection: 'row',
    paddingHorizontal: '10%',
    marginBottom: '0.5%',
  },
  helloText: {
    fontSize: 46,
    fontWeight: '300',
  },
  nameText: {fontSize: 18, fontWeight: 'bold'},
  discover: {
    fontSize: 40,
    fontFamily: 'Futura',
    fontWeight: '500',
  },
  discoverCaption: {
    marginTop: '3%',
    fontFamily: 'Futura',
    fontSize: 20,
    fontWeight: '400',
  },
});

export default FeedScreen;
