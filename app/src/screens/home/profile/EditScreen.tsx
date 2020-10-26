import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  KeyboardAvoidingView,
  Linking,
} from 'react-native';
import { Icon } from 'react-native-elements';
import { FlatList, TextInput } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../../assets';
import { fetchUser, User } from '../../../models';
import { ProfileEditScreenProps } from './ProfileTab';

type Props = {
  navigation: ProfileEditScreenProps;
};
type State = {
  user?: User;
};
type InputType = {
  placeholder: string;
  value: string;
  onTextChange: (query: string) => void;
  editable: boolean;
};

export default class EditScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      user: undefined,
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
          />
        </View>
      </View>
    );
  }

  componentDidMount() {
    fetchUser().then((user) => {
      this.setState({ user: user });
    });
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
                />
              )}
            />

            <KeyboardAvoidingView>
              <TouchableOpacity
                style={{
                  backgroundColor: '#6abf69',
                  padding: '4%',
                  borderRadius: 10,
                  justifyContent: 'center',
                  alignItems: 'center',
                  margin: '5%',
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
                    Linking.canOpenURL(
                      'https://www.odysseyapp.us/contact-us.html'
                    ).then((val) => {
                      if (val) {
                        Linking.openURL(
                          'https://www.odysseyapp.us/contact-us.html'
                        );
                      }
                    });
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
