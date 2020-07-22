import React from 'react';
import {StyleSheet, View, Text, TouchableOpacity} from 'react-native';
import {colors, storage} from '../../../assets';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-community/async-storage';
import {StackNavigationProp} from '@react-navigation/stack';
import routes from '../../../routes/routes';

type Props = {
  navigation: StackNavigationProp<any, any>;
};

type State = {};

class ProfileScreen extends React.Component<Props, State> {
  render() {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            auth()
              .signOut()
              .then(() => {
                AsyncStorage.setItem(storage.userSignedIn, 'false', () => {
                  this.props.navigation.navigate(routes.login);
                });
              });
          }}>
          <Text style={{color: 'white', fontWeight: 'bold'}}>
            Log out
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    padding: 20,
    backgroundColor: colors.continueButtonColor,
    borderRadius: 20,
  },
});

export default ProfileScreen;
