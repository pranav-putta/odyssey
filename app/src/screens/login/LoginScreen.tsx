import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TextInput,
  StatusBar,
  Animated,
  TouchableOpacity,
  Keyboard,
  Alert,
  KeyboardEvent,
  EmitterSubscription,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { colors, globalStyles, texts, storage } from '../../assets';
import { Icon } from 'react-native-elements';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import functions from '@react-native-firebase/functions';
import ViewPager from '@react-native-community/viewpager';
import { StackNavigationProp } from '@react-navigation/stack';
import ProgressHUD from '../../components/ProgressHUD';
import routes from '../../routes/routes';
import AsyncStorage from '@react-native-community/async-storage';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

// state type definitions
type State = {
  // progress of animation [0, 1], used by other animation handlers to update different components
  animation: Animated.Value;
  // height of continue button
  continueButtonY: Animated.Value;
  // phone number text
  phoneNumber: string;
  // formatted phone number text
  phoneNumberFormatted: string;
  // verification code as string array of size 6
  verification: string[];
  // verification text input data as string
  verificationText: string;
  // age text input data
  age: number;
  // address code text input data
  address: string;
  // name text input data
  name: string;
  // current login progress
  currentPageProgress: number;
  // is login screen open and visible
  hasLoginStarted: boolean;
  // user identification code
  uid: string;
  // show progress dialog
  showProgress: boolean;
};

type Props = {
  navigation: StackNavigationProp<any, any>;
};
class LoginScreen extends React.Component<Props, State> {
  // animation variables
  loginContainerHeight: Animated.AnimatedInterpolation;
  loginContainerMarginTop: Animated.AnimatedInterpolation;
  loginContainerBorderRadius: Animated.AnimatedInterpolation;
  phoneNumberInputHeight: Animated.AnimatedInterpolation;
  continueOpacity: Animated.AnimatedInterpolation;
  phoneNumberCaptionHeight: Animated.AnimatedInterpolation;
  continueButtonHeight: Animated.AnimatedInterpolation;
  keyboardDidShowListener: EmitterSubscription;
  keyboardDidHideListener: EmitterSubscription;

  // generated animated views
  AnimatableAnimatedView: Animatable.AnimatableComponent<any, any>;
  AnimatableImage: Animatable.AnimatableComponent<any, any>;
  AnimatedTouchableOpacity: Animated.AnimatedComponent<any>;
  AnimatedViewPager: Animated.AnimatedComponent<any>;

  // component references
  private phoneNumberTextInput = React.createRef<TextInput>();
  private viewPager = React.createRef<ViewPager>();
  private verificationBoxes = Array(6).fill(React.createRef<Text>());
  private verificationTextInput = React.createRef<TextInput>();
  private addressTextInput = React.createRef<GooglePlacesAutocomplete>();

  // instance variables
  private phoneVerificationResult: FirebaseAuthTypes.ConfirmationResult | null = null;

  // constants
  CONTINUE_HEIGHT: number = 30;

  // called when LoginScreen is opened
  constructor(props: any) {
    super(props);

    // generate initial state values
    this.state = {
      animation: new Animated.Value(0),
      hasLoginStarted: false,
      phoneNumber: '',
      phoneNumberFormatted: '',
      verification: Array(6).fill('-'),
      verificationText: '',
      currentPageProgress: 0,
      age: -1,
      address: '',
      name: '',
      uid: '',
      continueButtonY: new Animated.Value(this.CONTINUE_HEIGHT),
      showProgress: false,
    };

    // assign animation interpolations
    this.loginContainerHeight = this.state.animation.interpolate({
      inputRange: [0, 1],
      outputRange: ['22%', '100%'],
    });
    this.loginContainerMarginTop = this.state.animation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '40%'],
    });
    this.phoneNumberInputHeight = this.state.animation.interpolate({
      inputRange: [0, 1],
      outputRange: [50, 100],
    });
    this.continueOpacity = this.state.animation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });
    this.phoneNumberCaptionHeight = this.state.animation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 60],
    });
    this.continueButtonHeight = this.state.animation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '100%'],
    });
    this.loginContainerBorderRadius = this.state.animation.interpolate({
      inputRange: [0, 1],
      outputRange: [20, 2],
    });

    // generate custom animated views
    this.AnimatableAnimatedView = Animatable.createAnimatableComponent(
      Animated.View
    );
    this.AnimatedTouchableOpacity = Animated.createAnimatedComponent(
      TouchableOpacity
    );
    this.AnimatableImage = Animatable.createAnimatableComponent(Image);
    this.AnimatedViewPager = Animated.createAnimatedComponent(ViewPager);

    // add keyboard listeners to track continue button
    this.keyboardDidShowListener = Keyboard.addListener(
      'keyboardWillShow',
      this._keyboardWillShow
    );
    this.keyboardDidHideListener = Keyboard.addListener(
      'keyboardWillHide',
      this._keyboardWillHide
    );
  }

  componentWillUnmount() {
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }

  _keyboardWillShow = (e: KeyboardEvent) => {
    // animate continue button
    Animated.timing(this.state.continueButtonY, {
      toValue: e.endCoordinates.height + this.CONTINUE_HEIGHT,
      useNativeDriver: false,
      duration: e.duration,
    }).start();
  };

  _keyboardWillHide = (e: KeyboardEvent) => {
    Animated.timing(this.state.continueButtonY, {
      toValue: this.CONTINUE_HEIGHT,
      useNativeDriver: false,
      duration: e.duration,
    }).start();
  };

  toggleProgress = (show: boolean) => {
    this.setState({ showProgress: show });
  };

  // open up login screen
  startLoginAnimation = () => {
    // tells program that login page is now open
    this.setState({ hasLoginStarted: true });

    // start opening animation
    Animated.timing(this.state.animation, {
      toValue: 1,
      useNativeDriver: false,
      duration: 500,
    }).start(() => {
      // open the keyboard up
      this.phoneNumberTextInput.current?.focus();
    });
  };

  // go back to home login screen
  resetLoginAnimation = () => {
    Keyboard.dismiss();
    Animated.timing(this.state.animation, {
      toValue: 0,
      useNativeDriver: false,
      duration: 500,
    }).start(() => {
      // tells program that login page is now open
      this.setState({ hasLoginStarted: false });
    });
  };

  // progress to next page in login form
  nextLoginFormPage = () => {
    // incremenet page count and update states
    const newPage = this.state.currentPageProgress + 1;
    this.setState({ currentPageProgress: newPage });
    this.viewPager.current?.setPage(newPage);
  };

  // go to previous page in login form
  prevLoginFormPage = () => {
    // decrement page count and update states
    const newPage = this.state.currentPageProgress - 1;
    // if selected page is back to original, reset animations
    if (newPage >= 0) {
      this.setState({ currentPageProgress: newPage });
      this.viewPager.current?.setPage(newPage);
    } else {
      this.resetLoginAnimation();
    }
  };

  // call sign in with phone number
  handleSignIn = () => {
    // show progress dialog
    Keyboard.dismiss();
    this.toggleProgress(true);

    auth()
      .signInWithPhoneNumber('+1' + this.state.phoneNumber)
      .then((result) => {
        this.phoneVerificationResult = result;
        this.nextLoginFormPage();
      })
      .catch((err) => {
        Alert.alert(JSON.stringify(err));
      })
      .finally(() => {
        // hide progress dialog
        this.toggleProgress(false);
      });
  };

  // check if OTP code is valid
  handleVerification = () => {
    // show progress dialog
    Keyboard.dismiss();
    this.toggleProgress(true);

    const checkUserExists = (uuid: string) => {
      // check if user exists
      functions()
        .httpsCallable('userExists')({ uuid: uuid })
        .then((response) => {
          if (response.data.result) {
            // if user already exists
            this.completeLogin();
          } else {
            // if user doesn't exist, collect data
            this.nextLoginFormPage();
          }
        })
        .catch((err) => {
          this.toggleProgress(false);
          Alert.alert(JSON.stringify(err));
        })
        .finally(() => {
          // hide progress dialog
          this.toggleProgress(false);
        });
    };
    // check if verification text is legal
    if (this.state.verificationText.length != 6) {
      Alert.alert('Please enter a valid code.');
      return;
    }
    if (!this.phoneVerificationResult) {
      Alert.alert('Something went wrong. Please try again.');
      return;
    }
    this.phoneVerificationResult
      .confirm(this.state.verificationText)
      .then((result) => {
        this.setState({ uid: result?.user.uid || '' });
        checkUserExists(result?.user.uid || '');
      })
      .catch((err) => {
        this.toggleProgress(false);
        Alert.alert('The code was incorrect');
      });
  };

  // callback for login verification
  completeLogin = () => {
    // set storage item
    AsyncStorage.setItem(storage.userSignedIn, 'true');
    // send navigation to home screen
    this.props.navigation.navigate(routes.home);
  };

  handleCreateUser = () => {
    // show progress
    Keyboard.dismiss();
    this.toggleProgress(true);

    functions()
      .httpsCallable('newUser')({
        uuid: this.state.uid,
        phoneNumber: this.state.phoneNumber,
        name: this.state.name,
        age: this.state.age,
        address: this.state.address,
      })
      .then((response) => {
        if (response.data.result) {
          // if user is done creating
          this.completeLogin();
        } else {
          // if user doesn't exist, collect data
          Alert.alert(JSON.stringify(response.data.error));
        }
      })
      .catch((error) => {
        this.toggleProgress(false);
        Alert.alert(JSON.stringify(error));
      })
      .finally(() => {
        // hide progress
        this.toggleProgress(false);
      });
  };

  // generate back button
  backButton = () => {
    if (this.state.hasLoginStarted) {
      return (
        <Animated.View
          style={[styles.backButton, { opacity: this.continueOpacity }]}
        >
          <TouchableOpacity
            style={styles.backButtonTouchable}
            onPress={this.prevLoginFormPage}
          >
            <Icon
              size={26}
              name="angle-left"
              type="font-awesome"
              color="black"
            />
          </TouchableOpacity>
        </Animated.View>
      );
    } else {
      return null;
    }
  };

  // generate progress counter
  progressCounter = () => {
    return (
      <Animated.View
        style={[styles.progressCounter, { opacity: this.continueOpacity }]}
      >
        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
          {this.state.currentPageProgress + 1}/5
        </Text>
      </Animated.View>
    );
  };

  continueButton = (callback: () => void) => {
    // disable button when not shown
    return (
      <>
        {this.state.hasLoginStarted && (
          <Animated.View
            style={[
              styles.continueButtonContainer,
              {
                opacity: this.continueOpacity,
                bottom: this.state.continueButtonY,
              },
            ]}
          >
            <TouchableOpacity
              style={[styles.continueButton]}
              onPress={callback}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
              <View style={styles.continueButtonIcon}>
                <Icon name="angle-right" type="font-awesome" color="white" />
              </View>
            </TouchableOpacity>
          </Animated.View>
        )}
      </>
    );
  };

  finishButton = () => {
    // disable button when not shown
    return (
      <>
        {this.state.hasLoginStarted && (
          <Animated.View
            style={[
              styles.finishButtonContainer,
              {
                opacity: this.continueOpacity,
                bottom: this.state.continueButtonY,
              },
            ]}
          >
            <TouchableOpacity
              style={[styles.finishButton]}
              onPress={() => {
                const address =
                  this.addressTextInput.current?.getAddressText() || '';
                if (address.length > 0) {
                  this.setState({ address: address }, () => {
                    this.handleCreateUser();
                  });
                } else {
                  Alert.alert('Enter a valid address.');
                }
              }}
            >
              <Text style={styles.continueButtonText}>Finish</Text>
              <View style={styles.finishButtonIcon}>
                <Icon name="angle-right" type="font-awesome" color="white" />
              </View>
            </TouchableOpacity>
          </Animated.View>
        )}
      </>
    );
  };

  // enter phone number form
  phoneNumberPage = () => {
    // function which uses regex operations to format raw phone number
    const phoneNumberTextHandler = (input: string) => {
      // Strip all characters from the input except digits
      var numbers = input.replace(/\D/g, '');

      if (this.state.phoneNumber != numbers) {
        // Trim the remaining input to ten characters, to preserve phone number format
        numbers = numbers.substring(0, 10);

        // set still numbers state
        this.setState({ phoneNumber: numbers });

        // Based upon the length of the string, we add formatting as necessary
        var size = numbers.length;
        if (size == 0) {
          numbers = numbers;
        } else if (size < 3) {
          numbers = '(' + numbers;
        } else if (size < 7) {
          numbers =
            '(' + numbers.substring(0, 3) + ') ' + numbers.substring(3, 6);
        } else {
          numbers =
            '(' +
            numbers.substring(0, 3) +
            ') ' +
            numbers.substring(3, 6) +
            ' - ' +
            numbers.substring(6, 10);
        }

        // update formatted phone number
        this.setState({ phoneNumberFormatted: numbers });
      } else {
        // update formatted phone number
        this.setState({ phoneNumberFormatted: input });
      }
    };

    return (
      <Animated.View style={{ padding: '10%' }}>
        <Text style={styles.loginText}>Let's get started</Text>
        <Animated.Text
          style={[
            styles.ageCaptionText,
            { height: this.phoneNumberCaptionHeight },
          ]}
        >
          Mobile messaging rates and SMS charges may apply based on your service
          provider
        </Animated.Text>
        <TouchableWithoutFeedback
          onPress={() => {
            if (!this.state.hasLoginStarted) {
              this.startLoginAnimation();
            } else {
              this.phoneNumberTextInput.current?.focus();
            }
          }}
        >
          <Animated.View style={styles.loginPhoneNumber} pointerEvents="none">
            <Image
              style={styles.loginPhoneNumberIcon}
              source={require('../../assets/images/usa-flag.png')}
            />
            <TextInput
              style={styles.loginPhoneNumberTextInput}
              value={this.state.phoneNumberFormatted}
              onChangeText={phoneNumberTextHandler}
              keyboardType="phone-pad"
              placeholder="Enter your phone number"
              ref={this.phoneNumberTextInput}
            />
          </Animated.View>
        </TouchableWithoutFeedback>
        {this.continueButton(() => {
          if (this.state.phoneNumber.length == 10) {
            this.handleSignIn();
          } else {
            Alert.alert('Enter a valid phone number');
          }
        })}
      </Animated.View>
    );
  };

  // generate boxes for verification enter
  phoneNumberVerificationBoxes = () => {
    return (
      <View style={styles.verificationBoxContainer}>
        {this.verificationBoxes.map((value, index) => {
          return (
            <View
              key={index}
              onTouchEnd={() => {
                this.verificationTextInput.current?.focus();
              }}
              style={styles.verificationBox}
            >
              <Text
                ref={value}
                style={{
                  fontSize: 25,
                }}
              >
                {this.state.verification[index]}
              </Text>
            </View>
          );
        })}
      </View>
    );
  };

  // enter verification code form
  phoneNumberVerificationPage = () => {
    return (
      <Animated.View style={styles.pageContainer}>
        <Text style={styles.loginText}>Enter verification code</Text>
        {this.phoneNumberVerificationBoxes()}
        <TextInput
          ref={this.verificationTextInput}
          style={{ height: 0, width: 0 }}
          keyboardType="phone-pad"
          value={this.state.verificationText}
          onChangeText={(text: string) => {
            var newVerifs = Array(6).fill('-');
            if (text.length > 6) {
              text = text.substr(0, 6);
            }
            for (var i = 0; i < text.length; i++) {
              newVerifs[i] = text.charAt(i);
            }
            this.setState({ verification: newVerifs });
            this.setState({ verificationText: text });
          }}
        />
        {this.continueButton(this.handleVerification)}
      </Animated.View>
    );
  };

  // enter name form
  namePage = () => {
    return (
      <Animated.View style={styles.pageContainer}>
        <Text style={styles.loginText}>Name</Text>
        <Text style={styles.ageCaptionText}>
          This is how people and your representative will see you
        </Text>
        <Animated.View style={styles.loginPhoneNumber}>
          <TextInput
            style={{ fontSize: 18 }}
            value={this.state.name}
            onChangeText={(text) => {
              this.setState({ name: text });
            }}
            keyboardType="name-phone-pad"
            placeholder="Enter your name"
          />
        </Animated.View>
        {this.continueButton(() => {
          if (this.state.name != '') {
            this.nextLoginFormPage();
          } else {
            Alert.alert('Enter a valid name.');
          }
        })}
      </Animated.View>
    );
  };

  // enter age form
  agePage = () => {
    return (
      <Animated.View style={styles.pageContainer}>
        <Text style={styles.loginText}>Age</Text>
        <Text style={styles.ageCaptionText}>
          Your age helps inform your representatives about your background and
          voting power.
        </Text>
        <Animated.View style={styles.loginPhoneNumber}>
          <TextInput
            style={{ fontSize: 18 }}
            value={this.state.age == -1 ? '' : this.state.age.toString()}
            onChangeText={(text) => {
              var age = parseInt(text);
              if (age) {
                this.setState({ age: age });
              } else if (text == '') {
                this.setState({ age: -1 });
              }
            }}
            keyboardType="number-pad"
            placeholder="Enter your age"
          />
        </Animated.View>
        {this.continueButton(() => {
          if (this.state.age != -1) {
            this.nextLoginFormPage();
          } else {
            Alert.alert('Enter a valid age.');
          }
        })}
      </Animated.View>
    );
  };

  // enter address form
  addressPage = () => {
    return (
      <Animated.View style={styles.pageContainer}>
        <Text style={styles.loginText}>Address</Text>
        <Text style={styles.ageCaptionText}>
          Your address helps us connect you with your representative and
          senator.
        </Text>
        <GooglePlacesAutocomplete
          placeholder="Enter Location"
          minLength={2}
          autoFocus={false}
          returnKeyType={'default'}
          fetchDetails={false}
          textInputProps={{}}
          numberOfLines={3}
          ref={this.addressTextInput}
          query={{
            key: 'AIzaSyDjxmRVGsp0-2lcjHafbZvYX05DY5WsOeg',
            language: 'en',
          }}
          styles={{
            textInput: {
              borderWidth: 0,
              backgroundColor: colors.textInputBackground,
              borderRadius: 10,
              height: 50,
              fontSize: 18,
            },
            textInputContainer: {
              backgroundColor: 'transparent',
              borderColor: 'transparent',
              borderTopWidth: 0,
              borderBottomWidth: 0,
              marginBottom: 10,
            },
            row: {},
            description: {
              fontSize: 16,
            },
            container: {
              marginTop: '5%',
              borderWidth: 0,
              height: 150,
            },
          }}
          style={{ height: 150 }}
          enablePoweredByContainer={false}
        />
        <View style={{ height: '60%' }} />
        {this.finishButton()}
      </Animated.View>
    );
  };

  render() {
    return (
      <View style={styles.container}>
        <ProgressHUD visible={this.state.showProgress} />
        <StatusBar
          barStyle={
            this.state.hasLoginStarted ? 'dark-content' : 'light-content'
          }
          hidden={false}
          translucent={true}
        />

        <this.AnimatableImage
          animation="lightSpeedIn"
          duration={500}
          iterationCount={1}
          source={require('../../assets/images/dominoes.png')}
          style={styles.logoImage}
        />
        <Animatable.Text
          animation="bounceIn"
          duration={1500}
          iterationCount={1}
          style={styles.dominoText}
        >
          Domino
        </Animatable.Text>
        <Animatable.Text
          animation="fadeIn"
          delay={1000}
          duration={1000}
          iterationCount={1}
          style={styles.captionText}
        >
          {texts.loginCaption}
        </Animatable.Text>

        <this.AnimatableAnimatedView
          style={[
            styles.loginContainer,
            {
              flex: 1,
              height: this.loginContainerHeight,
              //height: "100%",
              borderTopLeftRadius: this.loginContainerBorderRadius,
              borderTopRightRadius: this.loginContainerBorderRadius,
            },
          ]}
          animation="slideInUp"
          duration={1000}
          iterationCount={1}
        >
          {this.backButton()}
          {this.progressCounter()}
          {/** Login Container */}
          <this.AnimatedViewPager
            style={{ flex: 1, marginTop: this.loginContainerMarginTop }}
            ref={this.viewPager}
            initialPage={0}
            scrollEnabled={false}
          >
            {this.phoneNumberPage()}
            {this.phoneNumberVerificationPage()}
            {this.namePage()}
            {this.agePage()}
            {this.addressPage()}
          </this.AnimatedViewPager>
        </this.AnimatableAnimatedView>
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
    marginTop: '70%',
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
  captionText: {
    fontSize: 30,
    fontWeight: 'bold',
    marginLeft: '10%',
    color: colors.dominoCaptionColor,
  },
  loginContainer: {
    flex: 1,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: 'white',
    zIndex: 100,
  },
  loginText: {
    ...globalStyles.headerText,
    fontSize: 30,
  },
  loginPhoneNumber: {
    backgroundColor: colors.textInputBackground,
    marginTop: '5%',
    paddingHorizontal: '5%',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
  },
  loginPhoneNumberIcon: {
    width: '7.5%',
    height: '100%',
    resizeMode: 'center',
  },
  loginPhoneNumberTextInput: {
    marginLeft: 10,
    fontSize: 18,
    color: 'black',
  },
  backButton: {
    position: 'absolute',
    width: 40,
    height: 40,
    left: '10%',
    top: '10%',
  },
  backButtonTouchable: {
    backgroundColor: colors.textInputBackground,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  progressCounter: {
    position: 'absolute',
    right: '10%',
    top: '10%',
    fontSize: 20,
    fontWeight: 'bold',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.continueButtonColor,
    borderRadius: 10,
    justifyContent: 'space-between',
  },
  finishButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.finishButtonColor,
    borderRadius: 10,
    justifyContent: 'space-between',
  },
  continueButtonContainer: {
    position: 'absolute',
    width: '100%',
    alignSelf: 'center',
    zIndex: 0,
  },
  finishButtonContainer: {
    position: 'absolute',
    width: '100%',
    alignSelf: 'center',
    zIndex: 0,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    margin: '5%',
  },
  continueButtonIcon: {
    backgroundColor: colors.continueButtonIconColor,
    width: 35,
    height: 35,
    marginRight: '2.5%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  finishButtonIcon: {
    backgroundColor: colors.finishButtonIconColor,
    width: 35,
    height: 35,
    marginRight: '2.5%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  ageCaptionText: {
    fontSize: 15,
    marginTop: '2.5%',
    color: 'gray',
  },
  verificationBox: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.textInputBackground,
    height: 60,
    width: 40,
    borderRadius: 10,
    flexDirection: 'row',
  },
  verificationBoxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: '5%',
  },
  pageContainer: {
    flex: 1,
    padding: '10%',
    paddingTop: '0%',
  },
});

export default LoginScreen;
