import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProfileSettingsScreenProps } from './ProfileTab';

interface Props {
  navigation: ProfileSettingsScreenProps;
}

export default function SettingsScreen(props: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => {
          props.navigation.goBack();
        }}
      >
        <Icon size={26} name="arrow-left" type="feather" color="black" />
      </TouchableOpacity>
      <View style={{ flex: 1 }} />
      <TouchableOpacity
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#ff5252',
          padding: 15,
          borderRadius: 10,
        }}
        onPress={() => {}}
      >
        <Text
          style={{
            color: 'white',
            fontFamily: 'Futura',
            fontWeight: '500',
            fontSize: 20,
          }}
        >
          Delete Account
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: '5%',
  },
  closeButton: {
    width: 40,
    height: 40,
    zIndex: 100,
    borderRadius: 12.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
