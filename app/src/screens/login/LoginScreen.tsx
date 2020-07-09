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
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import {colors, globalStyles, texts} from '../../assets';
import {Icon} from 'react-native-elements';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import ViewPager from '@react-native-community/viewpager';

// state type definitions
type State = {
  // progress of animation [0, 1], used by other animation handlers to update different components
  animation: Animated.Value;
  // phone number text
  phoneNumber: string;
  // verification code as string array of size 6
  verification: string[];
  // verification text input data as string
  verificationText: string;
  // age text input data
  age: string;
  // zip code text input data
  zipCode: string;
  // name text input data
  name: string;
  // current login progress
  currentPageProgress: number;
  // is login screen open and visible
  hasLoginStarted: boolean;
};

class LoginScreen extends React.Component<any, State> {
  // animation variables
  loginContainerHeight: Animated.AnimatedInterpolation;
  loginContainerMarginTop: Animated.AnimatedInterpolation;
  phoneNumberInputHeight: Animated.AnimatedInterpolation;
  continueOpacity: Animated.AnimatedInterpolation;

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

  // instance variables
  private phoneVerificationResult: FirebaseAuthTypes.ConfirmationResult | null = null;

  // called when LoginScreen is opened
  constructor(props: any) {
    super(props);

    // generate initial state values
    this.state = {
      animation: new Animated.Value(0),
      hasLoginStarted: false,
      phoneNumber: '',
      verification: Array(6).fill('-'),
      verificationText: '',
      currentPageProgress: 0,
      age: '',
      zipCode: '',
      name: '',
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

    // generate custom animated views
    this.AnimatableAnimatedView = Animatable.createAnimatableComponent(
      Animated.View,
    );
    this.AnimatedTouchableOpacity = Animated.createAnimatedComponent(
      TouchableOpacity,
    );
    this.AnimatableImage = Animatable.createAnimatableComponent(Image);
    this.AnimatedViewPager = Animated.createAnimatedComponent(ViewPager);
  }

  // open up login screen
  startLoginAnimation = () => {
    // start opening animation
    Animated.timing(this.state.animation, {
      toValue: 1,
      useNativeDriver: false,
      duration: 500,
    }).start(() => {
      // tells program that login page is now open
      this.setState({hasLoginStarted: true});
      // open the keyboard up
      this.phoneNumberTextInput.current?.focus();
    });
  };

  // go back to home login screen
  resetLoginAnimation = () => {
    this.setState({hasLoginStarted: false});
    Keyboard.dismiss();
    Animated.timing(this.state.animation, {
      toValue: 0,
      useNativeDriver: false,
      duration: 500,
    }).start();
  };

  // progress to next page in login form
  nextLoginFormPage = () => {
    // incremenet page count and update states
    const newPage = this.state.currentPageProgress + 1;
    this.setState({currentPageProgress: newPage});
    this.viewPager.current?.setPage(newPage);
  };

  // go to previous page in login form
  prevLoginFormPage = () => {
    // decrement page count and update states
    const newPage = this.state.currentPageProgress - 1;
    // if selected page is back to original, reset animations
    if (newPage >= 0) {
      this.setState({currentPageProgress: newPage});
      this.viewPager.current?.setPage(newPage);
    } else {
      this.resetLoginAnimation();
    }
  };

  // call sign in with phone number
  handleSignIn = () => {
    auth()
      .signInWithPhoneNumber('+1' + this.state.phoneNumber)
      .then((result) => {
        this.phoneVerificationResult = result;
        this.nextLoginFormPage();
      })
      .catch((err) => {
        Alert.alert(JSON.stringify(err));
      });
  };

  // check if OTP code is valid
  handleVerification = () => {
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
        this.nextLoginFormPage();
      })
      .catch((err) => {
        Alert.alert("That didn't work");
      });
  };

  // generate back button
  backButton = () => {
    if (this.state.hasLoginStarted) {
      return (
        <Animated.View style={styles.backButton}>
          <TouchableOpacity onPress={this.prevLoginFormPage}>
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
        style={[styles.progressCounter, {opacity: this.continueOpacity}]}>
        <Text style={{fontSize: 20, fontWeight: 'bold'}}>
          {this.state.currentPageProgress + 1}/5
        </Text>
      </Animated.View>
    );
  };

  // TODO: fix weird button graphics and make button stick on top of keyboard
  continueButton = (callback: () => void) => {
    return (
      <Animated.View
        style={[
          styles.continueButtonContainer,
          {opacity: this.continueOpacity},
        ]}>
        <TouchableOpacity style={styles.continueButton} onPress={callback}>
          <Text style={styles.continueButtonText}>Continue</Text>
          <View style={styles.continueButtonIcon}>
            <Icon name="angle-right" type="font-awesome" color="white" />
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // enter phone number form
  phoneNumberPage = () => {
    return (
      <Animated.View style={{padding: '10%'}}>
        <Text style={styles.loginText}>Let's get started</Text>
        <TouchableOpacity
          onPress={() => {
            this.startLoginAnimation();
          }}>
          <Animated.View style={styles.loginPhoneNumber} pointerEvents="none">
            <Image
              style={styles.loginPhoneNumberIcon}
              source={require('../../assets/images/usa-flag.png')}
            />
            <TextInput
              style={styles.loginPhoneNumberTextInput}
              value={this.state.phoneNumber}
              onChangeText={(text) => this.setState({phoneNumber: text})}
              keyboardType="phone-pad"
              placeholder="Enter your phone number"
              ref={this.phoneNumberTextInput}
            />
          </Animated.View>
        </TouchableOpacity>
        {this.continueButton(this.handleSignIn)}
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
              style={styles.verificationBox}>
              <Text
                ref={value}
                style={{
                  fontSize: 25,
                }}>
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
      <Animated.View style={{flex: 1, padding: '10%'}}>
        <Text style={styles.loginText}>Enter verification code</Text>
        {this.phoneNumberVerificationBoxes()}
        <TextInput
          ref={this.verificationTextInput}
          style={{height: 0, width: 0}}
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
            this.setState({verification: newVerifs});
            this.setState({verificationText: text});
          }}
        />
        {this.continueButton(this.handleVerification)}
      </Animated.View>
    );
  };

  // enter name form
  namePage = () => {
    return (
      <Animated.View style={{padding: '10%'}}>
        <Text style={styles.loginText}>Name</Text>
        <Text style={styles.ageCaptionText}>
          This is how people and your representative will see you
        </Text>
        <Animated.View style={styles.loginPhoneNumber}>
          <TextInput
            style={{fontSize: 18}}
            value={this.state.name}
            onChangeText={(text) => {
              this.setState({name: text});
            }}
            keyboardType="default"
            placeholder="Enter your name"
          />
        </Animated.View>
        {this.continueButton(() => {
          this.nextLoginFormPage();
        })}
      </Animated.View>
    );
  };

  // enter age form
  agePage = () => {
    return (
      <Animated.View style={{padding: '10%'}}>
        <Text style={styles.loginText}>Age</Text>
        <Text style={styles.ageCaptionText}>
          Your age helps inform your representatives about your background and
          voting power.
        </Text>
        <Animated.View style={styles.loginPhoneNumber}>
          <TextInput
            style={{fontSize: 18}}
            value={this.state.age.toString()}
            onChangeText={(text) => {
              this.setState({age: text});
            }}
            keyboardType="number-pad"
            placeholder="Enter your age"
          />
        </Animated.View>
        {this.continueButton(() => {
          var age = parseInt(this.state.age);
          if (age) {
            this.nextLoginFormPage();
          } else {
            Alert.alert('Enter a valid age.');
          }
        })}
      </Animated.View>
    );
  };

  // enter zipcodeform
  zipPage = () => {
    return (
      <Animated.View style={{padding: '10%'}}>
        <Text style={styles.loginText}>Zip Code</Text>
        <Text style={styles.ageCaptionText}>
          Your zip code helps us identify your representative
        </Text>
        <Animated.View style={styles.loginPhoneNumber}>
          <TextInput
            style={{fontSize: 18}}
            value={this.state.zipCode}
            onChangeText={(text) => {
              this.setState({zipCode: text});
            }}
            keyboardType="number-pad"
            placeholder="Enter your home ZIP code"
          />
        </Animated.View>
        {this.continueButton(() => {
          //finish login
          Alert.alert('finished login');
        })}
      </Animated.View>
    );
  };

  render() {
    return (
      <View style={styles.container}>
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
          style={styles.dominoText}>
          Domino
        </Animatable.Text>
        <Animatable.Text
          animation="fadeIn"
          delay={1000}
          duration={1000}
          iterationCount={1}
          style={styles.captionText}>
          {texts.loginCaption}
        </Animatable.Text>

        <this.AnimatableAnimatedView
          style={[
            styles.loginContainer,
            {flex: 1, height: this.loginContainerHeight},
          ]}
          animation="slideInUp"
          duration={1000}
          iterationCount={1}>
          {this.backButton()}
          {this.progressCounter()}
          {/** Login Container */}
          <this.AnimatedViewPager
            style={{flex: 1, marginTop: this.loginContainerMarginTop}}
            ref={this.viewPager}
            initialPage={0}
            scrollEnabled={false}>
            {this.phoneNumberPage()}
            {this.phoneNumberVerificationPage()}
            {this.namePage()}
            {this.agePage()}
            {this.zipPage()}
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
    borderRadius: 20,
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
  },
  backButton: {
    backgroundColor: colors.textInputBackground,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
    left: '10%',
    top: '10%',
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
    justifyContent: 'space-between',
  },
  continueButtonContainer: {
    backgroundColor: '#40c4ff',
    marginTop: '45%',
    borderRadius: 10,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    margin: '5%',
  },
  continueButtonIcon: {
    backgroundColor: '#80d8ff',
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
});

export default LoginScreen;
