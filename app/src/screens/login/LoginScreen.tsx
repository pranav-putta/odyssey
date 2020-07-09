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
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import {colors, globalStyles, texts} from '../../assets';

type State = {
  animation: Animated.Value;
  hasLoginStarted: boolean;
};

class LoginScreen extends React.Component<any, State> {
  // variables
  loginContainerHeight: Animated.AnimatedInterpolation;
  loginContainerMarginTop: Animated.AnimatedInterpolation;

  // animated views
  AnimatableAnimatedView: Animatable.AnimatableComponent<any, any>;
  AnimatableImage: Animatable.AnimatableComponent<any, any>;
  AnimatedTouchableOpacity: Animated.AnimatedComponent<any>;

  // refs
  private phoneNumberTextInput = React.createRef<TextInput>();

  constructor(props: any) {
    super(props);

    // set state
    this.state = {
      animation: new Animated.Value(0),
      hasLoginStarted: false,
    };

    // assign animation interpolations
    this.loginContainerHeight = this.state.animation.interpolate({
      inputRange: [0, 1],
      outputRange: ['22%', '100%'],
    });
    this.loginContainerMarginTop = this.state.animation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '30%'],
    });
    this.AnimatableAnimatedView = Animatable.createAnimatableComponent(
      Animated.View,
    );
    this.AnimatedTouchableOpacity = Animated.createAnimatedComponent(
      TouchableOpacity,
    );
    this.AnimatableImage = Animatable.createAnimatableComponent(Image);
  }

  startLoginAnimation = () => {
    Animated.timing(this.state.animation, {
      toValue: 1,
      useNativeDriver: false,
      duration: 500,
    }).start(() => {
      this.setState({hasLoginStarted: true});
      this.phoneNumberTextInput.current?.focus();
    });
  };

  backButton = () => {
    if (this.state.hasLoginStarted) {
      return (
        <TouchableOpacity style={styles.backButton}>
          <Text>Hi</Text>
        </TouchableOpacity>
      );
    } else {
      return null;
    }
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
          style={[styles.loginContainer, {height: this.loginContainerHeight}]}
          animation="slideInUp"
          duration={1000}
          iterationCount={1}>
          {this.backButton()}
          {/** Login Container */}
          <Animated.View style={{marginTop: this.loginContainerMarginTop}}>
            <Text style={styles.loginText}>Let's get started</Text>
            <TouchableOpacity
              onPress={() => {
                this.startLoginAnimation();
              }}>
              <View style={styles.loginPhoneNumber} pointerEvents="none">
                <Image
                  style={styles.loginPhoneNumberIcon}
                  source={require('../../assets/images/usa-flag.png')}
                />
                <TextInput
                  style={styles.loginPhoneNumberTextInput}
                  keyboardType="phone-pad"
                  placeholder="Enter your phone number"
                  ref={this.phoneNumberTextInput}
                />
              </View>
            </TouchableOpacity>
          </Animated.View>
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
    padding: '10%',
    borderRadius: 20,
  },
  loginText: {
    ...globalStyles.headerText,
    fontSize: 30,
  },
  loginPhoneNumber: {
    backgroundColor: colors.textInputBackground,
    marginTop: '5%',
    padding: '5%',
    borderRadius: 10,
    flexDirection: 'row',
  },
  loginPhoneNumberIcon: {
    width: '7%',
    height: '100%',
    resizeMode: 'cover',
  },
  loginPhoneNumberTextInput: {
    marginLeft: 10,
    fontSize: 15,
  },
  backButton: {
    position: 'absolute',
    marginTop: '25%',
    marginLeft: '15%',
  },
});

export default LoginScreen;
