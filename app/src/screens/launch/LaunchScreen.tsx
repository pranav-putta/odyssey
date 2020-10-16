import React from 'react';
import { StyleSheet, View, Text, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-community/async-storage';
import { globalStyles, storage } from '../../assets';
import routes from '../../routes/routes';
import { refresh } from '../../util/NetworkHandler';
import { firebase } from '@react-native-firebase/functions';

type Props = {
  navigation: StackNavigationProp<any, any>;
};

class LaunchScreen extends React.Component<Props> {
  componentDidMount() {
    //functions().useFunctionsEmulator("http://localhost:5001")
    const { navigation } = this.props;
    // check if user is signed in
    AsyncStorage.getItem(storage.userSignedIn)
      .then((signedIn) => {
        if (signedIn && signedIn == 'true') {
          refresh();
          navigation.navigate(routes.home);
        } else {
          // user is not signed in
          navigation.navigate(routes.login);
        }
      })
      .catch(() => {
        // something went wrong, route to login
        navigation.navigate(routes.login);
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
