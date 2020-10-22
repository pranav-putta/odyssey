import React from 'react';
import { StyleSheet, View, Text, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-community/async-storage';
import { globalStyles, storage } from '../../assets';
import routes from '../../routes/routes';
import { refresh } from '../../util/NetworkHandler';
import Global from '../../util/global';
import { LaunchScreenProps } from '../../App';

type Props = {
  navigation: LaunchScreenProps;
};

class LaunchScreen extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
    this.props.navigation.addListener('focus', () => {
      this.chooseRoute();
    });
  }

  componentDidMount() {
    this.chooseRoute();
  }

  chooseRoute() {
    const { navigation } = this.props;
    // check if user is signed in
    AsyncStorage.getItem(storage.userSignedIn)
      .then((signedIn) => {
        if (signedIn && signedIn == 'true') {
          refresh().finally(async () => {
            Global.setCategories();
            navigation.navigate('Home');
          });
        } else {
          // user is not signed in
          navigation.navigate('Login');
        }
      })
      .catch(() => {
        // something went wrong, route to login
        navigation.navigate('Login');
      });
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={[globalStyles.headerText, styles.dominoText]}>
          Odyssey
        </Text>
        <Text style={[globalStyles.captionText, styles.createdText]}>
          Created by Pranav Putta, Sunny Gandhi, and Dylan Hu
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  dominoText: {
    top: '50%',
  },
  createdText: {
    top: '88%',
  },
});

export default LaunchScreen;
