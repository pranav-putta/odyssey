import React from 'react';
import {View, Text} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import {storage} from '../../assets';

type State = {};
type Props = {};
class HomeScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }
  render() {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text>Hello</Text>
      </View>
    );
  }
}

export default HomeScreen;
