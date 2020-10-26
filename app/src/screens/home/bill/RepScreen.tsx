import React from 'react';
import {
  Alert,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Icon } from 'react-native-elements';
import FastImage from 'react-native-fast-image';
import { FlatList, TextInput } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SharedElement } from 'react-navigation-shared-element';
import { colors } from '../../../assets';
import {
  RepresentativeScreenProps,
  RepresentativeScreenRouteProp,
} from './BillTab';

type Props = {
  navigation: RepresentativeScreenProps;
  route: RepresentativeScreenRouteProp;
};
type State = {};

const replaceAt = (index: number, replacement: string, str: string) => {
  return (
    str.substr(0, index) + replacement + str.substr(index + replacement.length)
  );
};

export default class RepScreen extends React.Component<Props, State> {
  render() {
    const { rep } = this.props.route.params;
    let chamber = replaceAt(0, rep.chamber[0].toUpperCase(), rep.chamber);
    return (
      <View style={styles.card}>
        <View style={styles.container}>
          {this.closeButton()}
          <View style={styles.header}>
            <SharedElement id={`rep.${rep.member_url}.photo`}>
              <FastImage
                style={styles.image}
                source={{ uri: rep.picture_url }}
              />
            </SharedElement>
            <View style={styles.titleContainer}>
              <Text style={styles.chamber}>
                {chamber} District {rep.district}
              </Text>
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit={true}
                style={styles.name}
              >
                {rep.name}
              </Text>
            </View>
            <View
              style={[
                styles.party,
                {
                  backgroundColor:
                    rep.party == 'D' ? colors.democrat : colors.republican,
                },
              ]}
            >
              <Text style={styles.partyText}>{rep.party}</Text>
            </View>
          </View>
          <View style={styles.content}>
            <Text style={styles.contactText}>Contacts</Text>
            <FlatList
              scrollEnabled={false}
              keyExtractor={(item) => item.address}
              data={rep.contacts}
              renderItem={({ item, index }) => (
                <View style={styles.contactItemContainer}>
                  {item.address ? (
                    <TouchableOpacity
                      onPress={() => {
                        let address = item.address.replace(' ', '+');
                        Linking.canOpenURL(`maps://?addr=${address}`).then(
                          (val) => {
                            console.log(val);
                            if (val) {
                              Linking.openURL(
                                `http://maps.apple.com/maps?daddr=${address}`
                              );
                            }
                          }
                        );
                      }}
                    >
                      <Text
                        numberOfLines={2}
                        adjustsFontSizeToFit={true}
                        style={styles.address}
                      >
                        {item.address}
                      </Text>
                    </TouchableOpacity>
                  ) : undefined}
                  {item.phoneNumber && (
                    <TouchableOpacity
                      style={{ marginTop: '2.5%' }}
                      onPress={() => {
                        try {
                          let number = item.phoneNumber.replace(/\D/g, '');
                          Linking.canOpenURL(`tel:${number}`).then((val) => {
                            console.log(val);
                            if (val) {
                              Linking.openURL(`tel:${number}`);
                            }
                          });
                        } catch (err) {}
                      }}
                    >
                      <Text style={styles.phoneNumber}>{item.phoneNumber}</Text>
                    </TouchableOpacity>
                  )}
                  {item.email && (
                    <TouchableOpacity
                      style={{ marginTop: '2.5%' }}
                      onPress={() => {
                        try {
                          Linking.canOpenURL(`mailto:${item.email}`).then(
                            (val) => {
                              if (val) {
                                Linking.openURL(`mailto:${item.email}`);
                              } 
                            }
                          );
                        } catch (err) {}
                      }}
                    >
                      <Text style={styles.phoneNumber}>{item.email}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            />
          </View>
        </View>
      </View>
    );
  }

  // generate the close button
  closeButton = () => {
    return (
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => {
          this.props.navigation.goBack();
        }}
      >
        <Icon size={26} name="arrow-left" type="feather" color="black" />
      </TouchableOpacity>
    );
  };
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
    marginTop: '10%',
    marginHorizontal: '10%',
  },
  closeButton: {
    marginVertical: '5%',
    width: 40,
    height: 40,
    zIndex: 100,
    backgroundColor: colors.textInputBackground,
    borderRadius: 12.5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'black',
    shadowRadius: 5,
    shadowOpacity: 0,
    shadowOffset: { width: 0, height: 1 },
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: { marginTop: '5%' },
  image: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  name: {
    fontSize: 35,
    fontFamily: 'Futura',
    fontWeight: 'bold',
  },
  chamber: {
    fontSize: 15,
    fontFamily: 'Futura',
    fontWeight: '600',
  },
  titleContainer: {
    alignSelf: 'flex-end',
    paddingLeft: '5%',
    maxWidth: '60%',
  },
  party: {
    marginLeft: '10%',
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  partyText: {
    fontSize: 20,
    fontFamily: 'Futura',
    fontWeight: 'bold',
    color: 'white',
  },
  contactText: {
    fontFamily: 'Futura',
    fontWeight: '500',
    fontSize: 20,
  },
  contactItemContainer: {
    width: '100%',
    padding: '3.5%',
    justifyContent: 'center',
    paddingHorizontal: '5%',
    borderRadius: 5,
    backgroundColor: colors.textInputBackground,
    marginTop: '5%',
  },
  address: {
    fontFamily: 'Futura',
    fontWeight: '500',
    fontSize: 15,
  },
  phoneNumber: { color: '#2979ff' },
});
