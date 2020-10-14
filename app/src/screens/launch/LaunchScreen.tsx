import React from 'react';
import { StyleSheet, View, Text, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-community/async-storage';
import { globalStyles, storage } from '../../assets';
import routes from '../../routes/routes';
import functions from '@react-native-firebase/functions';
import { fetchUser, storeUser, User } from '../../models';
import app from '@react-native-firebase/app';
import { findReps } from '../../apis';

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
          this.refresh()
            .then(() => {})
            .catch((err) => {
              console.log(err);
            });
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

  refresh = async () => {
    let out = await functions().httpsCallable('getReps')({
      address: "261 dover circle, lake forest"
    });
    console.log(out.data);
    /*
    let user: User = data.data.result;
    storeUser(user);
    let reps = await findReps(user.address);*/
  };

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
