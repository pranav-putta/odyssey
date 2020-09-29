import React from 'react';
import {
  StyleSheet,
  View,
  Image,
  Text,
  Dimensions,
  ScrollView,
  Alert,
} from 'react-native';
import { colors } from '../../../assets';
import * as Animatable from 'react-native-animatable';
import BillSmallCard from './components/BillSmallCard';
import BillItem from './components/BillItem';
import Carousel from 'react-native-snap-carousel';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import BillDetailScreen, { Measure } from './BillDetailScreen';
import TouchableScale from 'react-native-touchable-scale';
import RepExpandedCard from './components/RepExpandedCard';
import { Icon } from 'react-native-elements';

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
  detailsExpanded: boolean;
  currentTab: BillTabKey;
  currentCard: number;
  repSelected: boolean;
  repSelectedInfo: {
    name: string;
    image: string;
    phoneNumber: string;
    address: string;
  };
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
          id: 'SB0022',
          title: 'MINIMUM WAGE/INCOME TAX CREDIT',
          category: 'Economy',
          description: `Amends the Minimum Wage Law. Makes a technical change in a Section concerning the short title. Replaces everything after the enacting clause. Amends the Illinois Income Tax Act and the Minimum Wage Law. Provides for an increase in the minimum wage and for a credit against withholding payments in relation to the increase. Increases the minimum wage to $9.25 per hour beginning January 1, 2020. Provides for annual increases in the minimum wage culminating in a minimum wage of $15 per hour beginning on January 1, 2025. Provides to employers with 50 or fewer full-time equivalent employees a credit against tax withheld beginning January 1, 2020. Reduces the credit beginning January 1, 2021. Provides employers may claim the credit amount in effect on January 1, 2025 until December 31, 2026 and that employers with no more than 5 employees may claim that credit until December 31, 2027. Authorizes the Department of Labor to perform random audits of employer to ascertain compliance with the Minimum Wage Law. Authorizes a penalty of $100 per employee for failure to maintain required records. Effective immediately.`,
          bgColor: '#ffab40',
          categoryColor: '#ffab4050',
          categoryTextColor: '#ffab40',
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
          id: 'HB0018',
          title: 'SCH CD-CHARACTER EDUCATION',
          category: 'Education',
          description: `Amends the School Code. Requires the instruction on character education to include the teaching of respect toward a person's race or ethnicity or gender.`,
          bgColor: '#7fd6db',
          categoryColor: '#7fd6db50',
          categoryTextColor: '#7fd6db',
          image: require('../../../assets/images/finance.png'),
        },
      ],
      search: '',
      selectedBill: undefined,
      billMeasure: undefined,
      showDetails: false,
      currentTab: BillTabKey.new,
      detailsExpanded: false,
      currentCard: 0,
      repSelected: false,
      repSelectedInfo: {
        address: '261 Dover Circle, Lake Forest, IL',
        image:
          'https://ilga.gov/images/members/%7B370B1494-7F8F-48BC-BD66-4756E15442E1%7D.jpg',
        name: 'Edgar Gonzales',
        phoneNumber: '847-770-2682',
      },
    };

    // create components
    this.AnimatableImage = Animatable.createAnimatableComponent(Image);
  }

  // generates top tab item { 'new' , 'liked' }
  tabItem = (label: string, key: BillTabKey) => {
    const active = key == this.state.currentTab;
    return (
      <TouchableScale
        style={styles.tabButton}
        disabled={active}
        onPress={() => {
          this.setState({ currentTab: key });
        }}
      >
        <Text
          style={[
            styles.tabText,
            { color: active ? 'black' : colors.darkGray },
          ]}
        >
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

  // creates tab bar
  tabBar = () => {
    return (
      <View style={styles.topTabs}>
        {this.tabItem('New', BillTabKey.new)}
        {this.tabItem('Liked', BillTabKey.liked)}
      </View>
    );
  };

  // carousel for new tab
  newTab = () => {
    return (
      <Carousel
        data={this.state.data}
        renderItem={(item: { item: BillItem; index: number }) => {
          return (
            <BillSmallCard
              index={item.index}
              item={item.item}
              onPress={(item: BillItem, index: number, measure: Measure) => {
                this.setState({ selectedBill: item });
                this.setState({ billMeasure: measure });
                this.setState({ showDetails: true });
                this.setState({ currentCard: index });
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
        autoplay={true}
        autoplayInterval={10000}
        firstItem={this.state.currentCard}
      />
    );
  };

  // view for liked tab
  likedTab = () => {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 24, marginBottom: '50%' }}>No Likes Yet!</Text>
      </View>
    );
  };

  // get the current tab selected and return corresponding view
  currentTabContent = () => {
    if (this.state.currentTab == BillTabKey.new) {
      return this.newTab();
    } else if (this.state.currentTab == BillTabKey.liked) {
      return this.likedTab();
    }
  };

  RepCard = (props: {
    name: string;
    image: string;
    phoneNumber: string;
    address: string;
    title: string;
  }) => {
    return (
      <TouchableScale
        style={styles.repcard}
        onPress={() => {
          this.setState({
            repSelectedInfo: {
              image: props.image,
              name: props.name,
              phoneNumber: props.phoneNumber,
              address: props.address,
            },
          });
          this.setState({ repSelected: true });
        }}
      >
        <View style={{ flexDirection: 'row' }}>
          <Image
            style={styles.repcardImage}
            source={{
              uri: props.image,
            }}
          />
          <View
            style={{
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              alignSelf: 'flex-end',
              marginLeft: '5%',
            }}
          >
            <Text
              style={{
                fontFamily: 'Roboto',
                fontSize: 17,
                fontWeight: 'bold',
                color: 'black',
              }}
            >
              {props.title}
            </Text>
            <Text
              numberOfLines={1}
              style={{
                fontFamily: 'Roboto',
                fontWeight: 'normal',
                color: 'black',
              }}
            >
              {props.name}
            </Text>
          </View>
          <Icon
            type={'feather'}
            name={'send'}
            color={'black'}
            size={20}
            containerStyle={{
              flex: 1,
              alignSelf: 'center',
            }}
            style={{ alignSelf: 'flex-end' }}
          />
        </View>
      </TouchableScale>
    );
  };

  mainScreen = () => {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <RepExpandedCard
          visible={this.state.repSelected}
          info={this.state.repSelectedInfo}
          dismiss={() => {
            this.setState({ repSelected: false });
          }}
        />
        <Text style={styles.discover}>Discover</Text>
        <View
          style={{
            marginTop: '2%',
            marginBottom: '6%',
            paddingHorizontal: '4%',
            borderRadius: 10,
            flexDirection: 'column',
          }}
        >
          <View style={{ flexDirection: 'row' }}>
            {this.RepCard({
              name: 'Michelle Mussman',
              image:
                'https://ilga.gov/images/members/%7B63BBD5DE-333E-4015-8658-4F7B2D45E1B7%7D.jpg',
              address: `257-S Stratton Office Building
                  Springfield, IL   62706`,
              phoneNumber: '(217) 782-3725',
              title: 'My Representative',
            })}
          </View>
          <View style={{ flexDirection: 'row' }}>
            {this.RepCard({
              name: 'Rachelle Crowe',
              image:
                'https://ilga.gov/images/members/%7B05406617-A6A5-4533-852E-04678B860D88%7D.jpg',
              phoneNumber: '(217) 782-5247',
              address: `Senator 56th District \n311B Capitol Building Springfield, IL 62706`,
              title: 'My Senator',
            })}
          </View>
        </View>
        {this.tabBar()}
        {this.currentTabContent()}
      </SafeAreaView>
    );
  };

  billModalScreen = () => {
    return (
      <View
        style={[StyleSheet.absoluteFill, { zIndex: 100 }]}
        pointerEvents={this.state.showDetails ? 'auto' : 'none'}
      >
        <BillDetailScreen
          item={this.state.selectedBill}
          measure={this.state.billMeasure}
          expanded={this.state.showDetails}
          onExpanded={() => {
            this.setState({ detailsExpanded: true });
          }}
          onStartClose={() => {
            this.setState({ detailsExpanded: false });
          }}
          onClose={() => {
            this.setState({ showDetails: false });
            this.setState({ selectedBill: undefined });
            this.setState({ billMeasure: undefined });
            this.props.toggleTabs();
          }}
        />
      </View>
    );
  };

  render() {
    return (
      <View style={styles.container}>
        {!this.state.detailsExpanded && this.mainScreen()}
        {this.billModalScreen()}
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
    alignSelf: 'center',
    marginBottom: '0.5%',
  },
  helloText: {
    fontSize: 46,
    fontWeight: '300',
  },
  nameText: { fontSize: 18, fontWeight: 'bold' },
  discover: {
    fontSize: 30,
    fontFamily: 'Futura',
    fontWeight: '500',
    textAlign: 'left',
    marginTop: '0%',
    marginLeft: '10%',
  },
  discoverCaption: {
    marginTop: '3%',
    fontFamily: 'Futura',
    fontSize: 20,
    fontWeight: '400',
  },
  repcard: {
    padding: 5,
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    borderRadius: 10,
    flex: 1,
    marginHorizontal: '5%',
    marginTop: 5,
    /*
    shadowColor: 'black',
    shadowRadius: 2.5,
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 0 },*/
  },
  repcardImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  repcardText: {
    fontSize: 12,
    fontWeight: '300',
    fontFamily: 'Roboto-Thin',
    textAlign: 'left',
    color: 'white',
  },
});

export default FeedScreen;
