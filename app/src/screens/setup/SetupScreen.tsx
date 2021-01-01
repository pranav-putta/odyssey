import ViewPager from '@react-native-community/viewpager';
import React from 'react';
import {
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardEvent,
  EmitterSubscription,
  Keyboard,
  Animated,
  Alert,
  Image,
} from 'react-native';
import { Icon } from 'react-native-elements';
import { colors } from '../../assets';
import Space from '../../components/Space';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { Config } from '../../util/Config';
import { SetupNavigation } from '../../App';
import { FlatList } from 'react-native-gesture-handler';
import { Topic } from '../../models/Topic';
import ProgressHUD from '../../components/ProgressHUD';
import store from '../../redux/store';
import { AuthService } from '../../redux/auth/auth';
import { AppState } from '../../redux/reducer';
import { UIStatus } from '../../redux/ui/ui.types';
import { connect } from 'react-redux';
import { UIService } from '../../redux/ui/ui';
import { userFromPartial } from '../../redux/models/user';

interface Props {
  navigation: SetupNavigation;
  progressVisible: boolean;
}
interface State {
  age: string;
  address: string;
  selectedTopics: { [name: string]: boolean };
  page: number;
}

function mapStateToSetup(state: AppState) {
  const { ui } = state;
  return {
    progressVisible: ui.status == UIStatus.loading,
  };
}

class SetupScreen extends React.Component<Props, State> {
  private viewPager = React.createRef<ViewPager>();

  pageValidated() {
    let ui = store.getState().ui;

    switch (ui.status) {
      case UIStatus.completed:
        this.next();
        store.dispatch(UIService.setStableState());
        break;
      case UIStatus.error:
        Alert.alert(ui.message ?? '');
        store.dispatch(UIService.setStableState());
        break;
      default:
        return;
    }
  }

  constructor(props: Props) {
    super(props);
    this.back = this.back.bind(this);
    this.continueClicked = this.continueClicked.bind(this);
    this.state = {
      age: '',
      address: '',
      selectedTopics: {},
      page: 0,
    };
    this.pageValidated = this.pageValidated.bind(this);
  }

  componentDidMount() {
    store.subscribe(this.pageValidated);
  }
  render() {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={{ flex: 1 }}>
          <TopBar onBackClick={this.back} />
          <Space height="4%" />
          <ViewPager
            style={{ flex: 1 }}
            ref={this.viewPager}
            scrollEnabled={false}
            initialPage={0}
          >
            <AgeScreen
              ageChanged={(age) => {
                this.setState({ age: age });
              }}
              age={this.state.age}
            />
            <AddressScreen
              addressChanged={(address) => {
                this.setState({ address: address });
              }}
              address={this.state.address}
            />
            <TopicsScreen
              topicsChanged={(topic: Topic) => {
                let tmp = this.state.selectedTopics;
                tmp[topic.name] = !(tmp[topic.name] || false);
                this.setState({ selectedTopics: tmp });
              }}
              selectedTopics={this.state.selectedTopics}
            />
          </ViewPager>
          <ContinueButton
            press={this.continueClicked}
            finish={this.state.page == 2}
            move={this.state.page != 1}
          />
        </View>
        <ProgressHUD visible={this.props.progressVisible} />
      </SafeAreaView>
    );
  }
  next() {
    if (this.state.page == 2) {
      // finish account creation
      store.dispatch(AuthService.createUser(AuthService.getUser()));
    } else {
      this.setState({ page: this.state.page + 1 }, () => {
        this.viewPager.current?.setPage(this.state.page);
      });
    }
  }
  back() {
    if (this.state.page > 0) {
      this.viewPager.current?.setPage(this.state.page - 1);
      this.setState({ page: this.state.page - 1 });
    } else {
      store.dispatch(AuthService.logout());
    }
  }

  continueClicked() {
    if (this.state.page == 0) {
      // age page
      this.ageSubmitted();
    } else if (this.state.page == 1) {
      // address page
      this.addressSubmitted();
    } else if (this.state.page == 2) {
      // topics page
      this.topicsSubmitted();
    }
  }

  ageSubmitted() {
    store.dispatch(AuthService.submitAge(this.state.age));
  }
  addressSubmitted() {
    store.dispatch(AuthService.submitAddress(this.state.address));
  }

  topicsSubmitted() {
    store.dispatch(AuthService.submitTopics(this.state.selectedTopics));
  }
}

interface TopBarProps {
  onBackClick: () => void;
}
interface TopBarState {}
class TopBar extends React.PureComponent<TopBarProps, TopBarState> {
  render() {
    return (
      <View
        style={{
          width: '100%',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: '2.5%',
        }}
      >
        <TouchableOpacity
          style={styles.backButtonTouchable}
          onPress={this.props.onBackClick}
        >
          <Icon size={20} name="arrow-left" type="feather" color="black" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, color: 'black', fontFamily: 'Futura' }}>
          Setup Account
        </Text>
      </View>
    );
  }
}

interface AgeState {}
interface AgeProps {
  age: string;
  ageChanged: (age: string) => void;
}

class AgeScreen extends React.Component<AgeProps, AgeState> {
  constructor(props: AgeProps) {
    super(props);
    this.state = {
      age: '',
    };
  }

  render() {
    return (
      <View style={{ alignItems: 'center' }}>
        <Text style={styles.title}>What is your age?</Text>
        <Space height={12} />
        <View style={styles.ageEntry}>
          <TextInput
            placeholder={'Enter age'}
            placeholderTextColor={colors.textInputPlaceholderColor}
            returnKeyType={'done'}
            keyboardType={'number-pad'}
            value={this.props.age}
            onChangeText={this.props.ageChanged}
            style={{
              flex: 1,
              textAlign: 'center',
              fontFamily: 'Futura',
              fontSize: 24,
            }}
          ></TextInput>
        </View>
      </View>
    );
  }
}

interface AddressProps {
  addressChanged: (address: string) => void;
  address: string;
}
interface AddressState {}

class AddressScreen extends React.Component<AddressProps, AddressState> {
  constructor(props: AddressProps) {
    super(props);
    this.state = {
      address: '',
    };
  }

  render() {
    return (
      <View style={{ height: '100%' }}>
        <Text style={styles.title}>What is your address?</Text>
        <Space height={5} />
        <Text style={styles.caption}>
          Your address is used to connect you with your representative.
        </Text>
        <Space height={5} />
        <GooglePlacesAutocomplete
          placeholder="Enter address"
          minLength={2}
          autoFocus={false}
          returnKeyType={'done'}
          fetchDetails={false}
          textInputProps={{}}
          placeholderTextColor={colors.textInputPlaceholderColor}
          numberOfLines={3}
          onPress={(data: any, details = null) => {
            const address = data.description;
            // check if illinois is in the offsets
            const terms: any[] = data.terms;
            let works = false;
            if (terms) {
              terms.forEach((t) => {
                if (t.value === 'IL') {
                  works = true;
                }
              });
            } else {
              works = true;
            }
            if (!works) {
              this.setState({ address: '' });
              Alert.alert(
                "You must be an Illinois resident currently. Sorry for the inconvenience! We'll be rolling out to new states in the coming months. Stay tuned."
              );
            } else {
              this.props.addressChanged(address);
            }
          }}
          query={{
            key: 'AIzaSyD2Z2NUt7iCykcEIeRHS77jI2zSIPn0b6g',
            language: 'en',
          }}
          style={{ width: '100%' }}
          styles={{
            container: { width: '100%', paddingHorizontal: '10%' },
            textInputContainer: {
              backgroundColor: 'transparent',
              borderTopWidth: 0,
              borderBottomWidth: 0,
              marginBottom: '10%',
            },
            textInput: {
              backgroundColor: colors.textInputBackground,
              padding: 0,
              margin: 0,
              textAlign: 'center',
              borderRadius: 10,
              height: 60,
              fontSize: 22,
              fontFamily: 'Futura',
            },
            description: { fontFamily: 'Futura', fontSize: 16 },
          }}
          enablePoweredByContainer={false}
        />
      </View>
    );
  }
}

interface TopicsProps {
  topicsChanged: (topic: Topic) => void;
  selectedTopics: { [name: string]: boolean };
}
interface TopicsState {}

class TopicsScreen extends React.Component<TopicsProps, TopicsState> {
  constructor(props: TopicsProps) {
    super(props);
    this.state = {};
  }
  render() {
    return (
      <View
        style={{
          height: '100%',
          alignItems: 'center',
        }}
      >
        <Text style={styles.title}>Choose topics you find interesting</Text>
        <Space height={12} />
        <FlatList
          numColumns={2}
          style={{ marginBottom: '20%', width: '100%' }}
          centerContent={true}
          contentContainerStyle={{ paddingHorizontal: '2.5%' }}
          keyExtractor={(item, i) => item.name + i.toString()}
          data={Config.getSmallTopicsAsArray().filter((val) => val.display)}
          renderItem={(data) => {
            let clicked = this.props.selectedTopics[data.item.name] || false;
            return this.TopicItem({ clicked: clicked, data: data.item });
          }}
        />
      </View>
    );
  }
  continueClicked() {}

  TopicItem(props: { clicked: boolean; data: Topic }) {
    return (
      <View
        key={props.data.name + props.data.display}
        style={{
          // TODO: change height to percent
          flex: 1,
        }}
      >
        <TouchableOpacity
          style={{
            backgroundColor: props.clicked
              ? props.data.color
              : colors.textInputBackground,
            flex: 1,
            borderRadius: 10,
            justifyContent: 'space-between',
            paddingVertical: '10%',
            alignItems: 'center',
            borderWidth: props.clicked ? 0 : 0,
            borderColor: 'grey',
            margin: '5%',
          }}
          onPress={() => {
            this.props.topicsChanged(props.data);
          }}
        >
          <Image
            style={{ height: 70, width: 70 }}
            source={{ uri: props.data.image }}
          />
          <Text
            style={{
              bottom: 0,
              fontSize: 18,
              color: props.clicked ? props.data.textColor : 'black',
              fontWeight: 'bold',
            }}
          >
            {props.data.name}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
}

interface ContinueState {}
interface ContinueProps {
  press: () => void;
  finish: boolean;
  move: boolean;
}
class ContinueButton extends React.Component<ContinueProps, ContinueState> {
  private keyboardDidShowListener: EmitterSubscription;
  private keyboardDidHideListener: EmitterSubscription;
  private continueButtonY: Animated.Value;

  private height = 5;

  render() {
    return (
      <Animated.View
        style={{
          position: 'absolute',
          bottom: this.continueButtonY,
          width: '100%',
          paddingHorizontal: '10%',
        }}
      >
        <TouchableOpacity
          style={{
            height: 60,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: this.props.finish ? '#00e676' : '#42a5f5',
            borderRadius: 10,
          }}
          onPress={this.props.press}
        >
          <Text style={styles.continueButtonText}>
            {this.props.finish ? 'Finish' : 'Continue'}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  constructor(props: any) {
    super(props);
    // add keyboard listeners to track continue button
    this.keyboardDidShowListener = Keyboard.addListener(
      'keyboardWillShow',
      this._keyboardWillShow
    );
    this.keyboardDidHideListener = Keyboard.addListener(
      'keyboardWillHide',
      this._keyboardWillHide
    );
    this.continueButtonY = new Animated.Value(this.height);
  }

  componentWillUnmount() {
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }

  _keyboardWillShow = (e: KeyboardEvent) => {
    // animate continue button
    if (this.props.move) {
      Animated.timing(this.continueButtonY, {
        toValue: e.endCoordinates.height + this.height,
        useNativeDriver: false,
        duration: e.duration,
      }).start();
    }
  };

  _keyboardWillHide = (e: KeyboardEvent) => {
    Animated.timing(this.continueButtonY, {
      toValue: this.height,
      useNativeDriver: false,
      duration: e.duration,
    }).start();
  };
}

const styles = StyleSheet.create({
  title: {
    fontSize: 25,
    fontFamily: 'Roboto',
    fontWeight: '500',
    alignSelf: 'center',
    marginHorizontal: '5%',
    textAlign: 'center',
  },
  caption: {
    fontFamily: 'Futura',
    fontSize: 18,
    textAlign: 'center',
    marginHorizontal: '5%',
    color: colors.textInputPlaceholderColor,
  },
  ageEntry: {
    width: '75%',
    height: 60,
    borderRadius: 10,
    backgroundColor: colors.textInputBackground,
  },
  backButtonTouchable: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    position: 'absolute',
    left: '10%',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'Futura',
    fontWeight: '500',
  },
});

export default connect(mapStateToSetup)(SetupScreen);