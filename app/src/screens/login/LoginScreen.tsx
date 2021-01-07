import React from 'react';
import {
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { Icon } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LoginNavigation } from '../../App';
import ProgressHUD from '../../components/ProgressHUD';
import Space from '../../components/Space';
import { Browser } from '../../util/Browser';
import RaisedButton from './components/RaisedButton';
import { AuthLoginType } from '../../redux/auth/auth.types';
import { AppState } from '../../redux/reducer';
import store, { AppDispatch } from '../../redux/store';
import { UIStatus } from '../../redux/ui/ui.types';
import { connect } from 'react-redux';
import { AuthService } from '../../redux/auth';

interface State {}
interface Props {
  navigation: LoginNavigation;
  progressVisible: boolean;
}

function mapStateToLogin(state: AppState) {
  const { ui } = state;
  return {
    progressVisible: ui.status === UIStatus.loading,
  };
}

class LoginScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.login = this.login.bind(this);
  }

  render() {
    return (
      <View style={styles.container}>
        {Platform.select({
          ios: (
            <StatusBar
              barStyle={'light-content'}
              hidden={false}
              translucent={true}
            />
          ),
        })}
        <ProgressHUD visible={this.props.progressVisible} />
        <Image
          source={require('../../assets/images/login_bg.jpg')}
          style={styles.backgroundImage}
        />
        <Animatable.View
          animation="fadeIn"
          delay={250}
          duration={1500}
          style={styles.backgroundOverlay}
        />
        <SafeAreaView style={{ flex: 1, zIndex: 10 }}>
          <TopBar login={this.login} />
        </SafeAreaView>
        <Headline />
        <LoginOptions login={this.login} />
      </View>
    );
  }

  login(type: AuthLoginType) {
    store.dispatch(AuthService.login(type));
  }
}

interface TopBarProps {
  login: (type: AuthLoginType) => void;
}
interface TopBarState {}
class TopBar extends React.PureComponent<TopBarProps, TopBarState> {
  constructor(props: TopBarProps) {
    super(props);
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <Animatable.View
          style={styles.topBarContainer}
          duration={500}
          delay={1500}
          animation="fadeIn"
        >
          <TouchableOpacity onPress={this.onInfoButtonPress}>
            <Icon name="info" type="feather" color={'white'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => {
              this.props.login('anonymous');
            }}
          >
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
        </Animatable.View>
      </View>
    );
  }

  onInfoButtonPress() {
    Browser.openURL('https://www.odysseyapp.us/about-us/index.html', true, false);
  }
}
class Headline extends React.PureComponent {
  render() {
    return (
      <View style={styles.headlineContainer}>
        <Animatable.Image
          animation="fadeIn"
          delay={200}
          duration={1500}
          source={require('../../assets/images/login_ic.png')}
          style={styles.logoImage}
        />
        <Animatable.Text
          animation="fadeIn"
          duration={1500}
          iterationCount={1}
          style={styles.headlineText}
        >
          Odyssey
        </Animatable.Text>
        <Animatable.Text
          animation="fadeIn"
          duration={1500}
          iterationCount={1}
          style={styles.captionText}
          numberOfLines={2}
          adjustsFontSizeToFit={true}
        >
          Journey to a new generation of democracy
        </Animatable.Text>
      </View>
    );
  }
}

interface LoginOptionsProps {
  login: (type: AuthLoginType) => void;
}
interface LoginOptionsState {}
class LoginOptions extends React.Component<
  LoginOptionsProps,
  LoginOptionsState
> {
  constructor(props: LoginOptionsProps) {
    super(props);

    this.state = {
      inProgress: 'none',
    };
  }
  render() {
    return (
      <Animatable.View
        style={styles.loginOptionsContainer}
        duration={1500}
        delay={1000}
        animation="slideInUp"
      >
        <Text style={styles.loginText}>Let's get started</Text>
        <Space height={20} />
        <RaisedButton
          label="Sign in with Apple"
          color="black"
          icon={{ name: 'logo-apple', type: 'ionicon' }}
          onPress={() => {
            this.props.login('apple');
          }}
        />
        <Space height={15} />
        <RaisedButton
          label="Sign in with Google"
          color="#ef5350"
          icon={{ name: 'logo-google', type: 'ionicon' }}
          onPress={() => {
            this.props.login('google');
          }}
        />
      </Animatable.View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  backgroundOverlay: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  topBarContainer: {
    top: '1%',
    width: '100%',
    paddingLeft: '7.5%',
    paddingRight: '5%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
    position: 'absolute',
  },
  headlineContainer: {
    paddingLeft: '7.5%',
    paddingRight: '7.5%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  skipButton: {
    borderRadius: 15,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    paddingHorizontal: 15,
  },
  skipButtonText: {
    fontFamily: 'Futura',
    fontSize: 16,
    fontWeight: '600',
  },
  logoImage: {
    height: '2%',
    width: '2%',
    borderRadius: 20,
    padding: '10%',
  },
  headlineText: {
    fontFamily: 'Roboto',
    marginTop: '2.5%',
    color: 'white',
    fontWeight: 'bold',
    fontSize: 50,
  },
  captionText: {
    fontSize: 26,
    fontFamily: 'Roboto',
    fontWeight: '600',
    color: 'white',
  },
  loginText: {
    fontFamily: 'Roboto',
    fontSize: 26,
    fontWeight: '500',
    textAlign: 'center',
  },
  loginOptionsContainer: {
    position: 'absolute',
    width: '100%',
    backgroundColor: 'white',
    bottom: 0,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    paddingTop: '5%',
    paddingBottom: '7.5%',
    paddingHorizontal: '7.5%',
    zIndex: 10,
  },
});

export default connect(mapStateToLogin)(LoginScreen);
