import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Linking,
  Image,
} from 'react-native';
import { colors, storage } from '../../../assets';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-community/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchUser, uploadPFP, userExists } from '../../../util';
import { User } from '../../../models';
import { Icon } from 'react-native-elements';
import { ProfileScreenParams, ProfileScreenProps } from './ProfileTab';
import ImagePicker from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';
import FastImage from 'react-native-fast-image';

type Props = {
  navigation: ProfileScreenProps;
  route: ProfileScreenParams;
};

type State = {
  user?: User;
};

class ProfileScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      user: undefined,
    };
  }

  componentDidMount() {
    fetchUser().then((user) => {
      this.setState({ user: user });
    });
  }

  Item = (props: { icon: string; item: string; index: number }) => {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-start',
          marginTop: props.index == 0 ? '0%' : '5%',
        }}
      >
        <Image
          style={{ flex: 1.2, width: 50, height: 50, resizeMode: 'center' }}
          source={{
            uri: props.icon,
          }}
        />
        <Text
          style={{
            marginLeft: '5%',
            flex: 10,
            fontFamily: 'Futura',
            fontSize: 16,
            fontWeight: '500',
          }}
          numberOfLines={2}
          adjustsFontSizeToFit={true}
        >
          {props.item}
        </Text>
      </View>
    );
  };

  formatPhoneNumber = (numbers: string) => {
    var size = numbers.length;
    if (size == 0) {
      numbers = numbers;
    } else if (size < 3) {
      numbers = '(' + numbers;
    } else if (size < 7) {
      numbers = '(' + numbers.substring(0, 3) + ') ' + numbers.substring(3, 6);
    } else {
      numbers =
        '(' +
        numbers.substring(0, 3) +
        ') ' +
        numbers.substring(3, 6) +
        ' - ' +
        numbers.substring(6, 10);
    }
    return numbers;
  };

  render() {
    const user = this.state.user;
    console.log(user?.pfp_url);
    if (user) {
      console.log(user.pfp_url);
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.headerBar}>
            <TouchableOpacity
              style={{ marginLeft: '5%' }}
              onPress={() => {
                this.props.navigation.push('Edit');
              }}
            >
              <Icon name="edit" type="feather" size={26} />
            </TouchableOpacity>
          </View>
          <View style={styles.header}>
            <View>
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  bottom: 0,
                  width: '100%',
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  zIndex: 10,
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: 5,
                  borderBottomLeftRadius: 10,
                  borderBottomRightRadius: 10,
                }}
                onPress={() => {
                  ImagePicker.showImagePicker(
                    {
                      title: 'Select Profile Picture',
                      storageOptions: {
                        skipBackup: true,
                        path: 'images',
                      },
                    },
                    (response) => {
                      if (!response.didCancel && !response.error) {
                        ImageResizer.createResizedImage(
                          response.uri,
                          100,
                          100,
                          'PNG',
                          50
                        ).then(({ uri }) => {
                          if (this.state.user) {
                            uploadPFP(user, uri);
                            let temp = this.state.user;
                            temp.pfp_url = response.uri;
                            this.setState({ user: temp });
                          }
                        });
                      }
                    }
                  );
                }}
              >
                <Text
                  style={{
                    color: 'white',
                    fontFamily: 'Futura',
                    fontSize: 12,
                    fontWeight: '600',
                  }}
                >
                  change
                </Text>
              </TouchableOpacity>
              <FastImage
                style={{ width: 75, height: 75, borderRadius: 10 }}
                source={{
                  uri: user.pfp_url + '?cache=' + Date.now(),
                }}
              />
            </View>
            <Text style={styles.name}>{user.name}</Text>
          </View>
          <View
            style={{
              marginHorizontal: '10%',
              backgroundColor: colors.textInputBackground,
              borderRadius: 10,
              padding: '5%',
            }}
          >
            <this.Item
              icon={
                'https://cdn1.iconfinder.com/data/icons/flat-and-simple-part-1/128/location-512.png'
              }
              item={user.address}
              index={0}
            />
            <this.Item
              icon={
                'https://cdn4.iconfinder.com/data/icons/gradient-ui-1/512/phone-256.png'
              }
              item={this.formatPhoneNumber(user.phoneNumber)}
              index={1}
            />
          </View>
          <View style={{ marginHorizontal: '10%', marginTop: '5%' }}>
            <TouchableOpacity
              style={{ alignSelf: 'center', margin: '5%' }}
              onPress={() => {
                Linking.canOpenURL('http://www.odysseyapp.us').then((val) => {
                  if (val) {
                    Linking.openURL('http://www.odysseyapp.us');
                  }
                });
              }}
            >
              <Text
                style={{
                  fontFamily: 'Futura',
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#2196f3',
                }}
              >
                www.odysseyapp.us
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#ff5252',
                padding: 15,
                borderRadius: 10,
              }}
              onPress={() => {
                auth().signOut();
                AsyncStorage.setItem(storage.userSignedIn, 'false');
              }}
            >
              <Text
                style={{
                  color: 'white',
                  fontFamily: 'Futura',
                  fontWeight: '500',
                  fontSize: 20,
                }}
              >
                Log Out
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    } else {
      return <View style={styles.container}></View>;
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  button: {
    padding: 20,
    backgroundColor: colors.continueButtonColor,
    borderRadius: 20,
  },
  headerBar: {
    flexDirection: 'row',
    marginHorizontal: '10%',
    justifyContent: 'flex-end',
  },
  header: {
    marginVertical: '5%',
    marginHorizontal: '10%',
    flexDirection: 'row',
  },
  name: {
    alignSelf: 'flex-end',
    marginLeft: '5%',
    fontSize: 35,
    fontFamily: 'Futura',
  },
});

export default ProfileScreen;
