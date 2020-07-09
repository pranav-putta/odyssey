import React from 'react';
import {StyleSheet, View, Text, Alert} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import auth from '@react-native-firebase/auth';
import globalStyles from '../../assets/styles';
import {routes} from '../../App';

type Props = {
  navigation: StackNavigationProp<any, any>;
};

class LaunchScreen extends React.Component<Props> {
  componentDidMount() {
    const {navigation} = this.props;
    // listen for firebase authentication state
    auth().onAuthStateChanged(function (user) {
      if (user) {
        Alert.alert('user signed in!');
      } else {
        navigation.navigate(routes.login);
      }
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={[globalStyles.headerText, styles.dominoText]}>Domino</Text>
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
