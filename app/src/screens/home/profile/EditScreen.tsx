import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  KeyboardAvoidingView,
  Linking,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { Icon } from 'react-native-elements';
import { FlatList, TextInput } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, storage } from '../../../assets';
import ProgressHUD from '../../../components/ProgressHUD';
import { Network } from '../../../util';
import { ProfileEditScreenProps } from './ProfileTab';
import auth from '@react-native-firebase/auth';
import { Browser } from '../../../util/Browser';
import { User } from '../../../redux/models/user';
import { StorageService } from '../../../redux/storage';
import store from '../../../redux/store';

type Props = {
  navigation: ProfileEditScreenProps;
};
type State = {
  user?: User;
  progress: boolean;
};
type InputType = {
  placeholder: string;
  value: string;
  onTextChange: (query: string) => void;
  email?: boolean;
  editable: boolean;
};

export default class EditScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      user: undefined,
      progress: false,
    };
  }

  Input(props: InputType) {
    return (
      <View style={{ marginHorizontal: '5%', marginTop: '5%' }}>
        <Text
          style={{
            margin: '1%',
            marginLeft: '2%',
            marginBottom: '2%',
            fontFamily: 'Futura',
            fontWeight: '500',
            fontSize: 16,
          }}
        >
          {props.placeholder}
        </Text>

        <View
          style={{
            backgroundColor: colors.textInputBackground,
            padding: 15,
            borderRadius: 10,
          }}
        >
          <TextInput
            value={props.value}
            onChangeText={props.onTextChange}
            placeholder={props.placeholder}
            editable={props.editable ? true : false}
            keyboardType={props.email ? 'email-address' : 'default'}
            returnKeyType="done"
          />
        </View>
      </View>
    );
  }

  componentDidMount() {
    this.setState({ user: StorageService.user() });
  }

  render() {
    if (this.state.user) {
      const data: InputType[] = [
        {
          placeholder: 'Name',
          value: this.state.user?.name,
          onTextChange: (name) => {
            let user = this.state.user;
            if (user) {
              user.name = name;
              this.setState({ user: user });
            }
          },
          editable: true,
        },
        {
          placeholder: 'Address',
          value: this.state.user?.address,
          onTextChange: (address) => {
            let user = this.state.user;
            if (user) {
              user.address = address;
              this.setState({ user: user });
            }
          },
          editable: true,
        },
        {
          placeholder: 'Email',
          value: this.state.user?.email,
          onTextChange: (email) => {
            let user = this.state.user;
            if (user) {
              user.email = email;
              this.setState({ user: user });
            }
          },
          email: true,
          editable: true,
        },
        {
          placeholder: 'Age',
          value: this.state.user?.age.toString(),
          onTextChange: () => {},
          editable: false,
        },
      ];

      return (
        <View style={styles.card}>
          <ProgressHUD visible={this.state.progress} />
          <SafeAreaView style={styles.container}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {this.closeButton()}
              <Text
                style={{
                  fontFamily: 'Futura',
                  marginLeft: '5%',
                  fontSize: 24,
                  fontWeight: '500',
                }}
              >
                Edit Profile
              </Text>
            </View>

            <FlatList
              data={data}
              keyExtractor={(i) => i.placeholder}
              renderItem={({ item }) => (
                <this.Input
                  placeholder={item.placeholder}
                  onTextChange={item.onTextChange}
                  value={item.value}
                  editable={item.editable}
                  email={item.email}
                />
              )}
            />

            <KeyboardAvoidingView>
              <TouchableOpacity
                style={{
                  backgroundColor: '#69f0ae',
                  padding: '4%',
                  borderRadius: 10,
                  justifyContent: 'center',
                  alignItems: 'center',
                  margin: '5%',
                }}
                onPress={() => {
                  if (this.state.user) {
                    this.setState({ progress: true });
                    Network.updateProfile(this.state.user)
                      .then((val) => {
                        if (val) {
                          if (this.state.user) {
                            store.dispatch(
                              StorageService.update({
                                user: this.state.user,
                              })
                            );
                          }
                        }
                      })
                      .finally(() => {
                        this.setState({ progress: false });
                      });
                  }
                }}
              >
                <Text
                  style={{
                    color: 'white',
                    fontWeight: '600',
                    fontFamily: 'Futura',
                    fontSize: 18,
                  }}
                >
                  Save Changes
                </Text>
              </TouchableOpacity>

              <View style={{ justifyContent: 'center' }}>
                <TouchableOpacity
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '2.5%',
                  }}
                  onPress={() => {
                    Browser.openURL(
                      'https://www.odysseyapp.us/privacy.html',
                      true,
                      false
                    );
                  }}
                >
                  <Text
                    style={{
                      fontFamily: 'Futura',
                      fontSize: 15,
                      color: '#6ec6ff',
                    }}
                  >
                    Contact us for more options
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ justifyContent: 'center', alignItems: 'center' }}
                  onPress={() => {
                    Alert.alert(
                      'Delete Account',
                      'Are you sure you want to permanently delete your account and data?',
                      [
                        {
                          text: 'Delete',
                          style: 'destructive',
                          onPress: () => {
                            Network.deleteUser().finally(() => {
                              auth().signOut();
                              AsyncStorage.setItem(
                                storage.userSignedIn,
                                'false'
                              );
                            });
                          },
                        },
                        { text: 'Cancel', style: 'cancel' },
                      ],
                      { cancelable: true }
                    );
                  }}
                >
                  <Text
                    style={{
                      fontFamily: 'Futura',
                      fontSize: 12,
                      color: '#f05545',
                    }}
                  >
                    Delete Account
                  </Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </View>
      );
    } else {
      return <View></View>;
    }
  }
  closeButton = () => {
    return (
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => {
          this.props.navigation.pop();
        }}
      >
        <Icon size={26} name="arrow-left" type="feather" color="black" />
      </TouchableOpacity>
    );
  };
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    flex: 1,
  },
  container: {
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
