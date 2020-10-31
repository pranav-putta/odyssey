import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { colors } from '../assets';
import Modal from 'react-native-modal';
// @ts-ignore
import { WaveIndicator } from 'react-native-indicators';
import { Notification, NotificationActionTypes } from '../models/Notification';
import FastImage from 'react-native-fast-image';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Browser } from '../util/Browser';

type State = {};

type Props = {
  notification?: Notification;
  dismiss: () => void;
};

class NotificationCard extends React.Component<Props, State> {
  render() {
    const { notification } = this.props;
    return (
      <Modal
        key={'NotificationCard'}
        animationOut="slideOutDown"
        isVisible={notification != undefined}
        backdropOpacity={0.4}
      >
        <View style={styles.container}>
          {notification && (
            <View style={styles.dialog}>
              <FastImage
                style={styles.image}
                source={{ uri: notification.image }}
              />
              <View style={styles.content}>
                <Text style={styles.title}>{notification.title}</Text>
                <Text style={styles.body}>{notification.body}</Text>
              </View>
              <View style={styles.buttons}>
                {notification.buttons.map((val) => (
                  <TouchableOpacity
                    onPress={() => {
                      if (val.action.action == NotificationActionTypes.link) {
                        if (val.action.path) {
                          Browser.openURL(val.action.path);
                        }
                      } else if (
                        val.action.action == NotificationActionTypes.screen
                      ) {
                        // todo: implement screen actions
                      } else if (
                        val.action.action == NotificationActionTypes.none
                      ) {
                        this.props.dismiss();
                      }
                    }}
                  >
                    <Text style={[styles.button, { color: val.color }]}>
                      {val.label.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '40%',
  },
  dialog: {
    borderRadius: 10,
    backgroundColor: 'white',
    width: '85%',
    height: '50%',
    overflow: 'hidden',
  },
  content: {
    margin: '7.5%',
    flex: 1,
  },
  title: {
    fontFamily: 'Futura',
    fontSize: 20,
    fontWeight: 'bold',
  },
  body: {
    fontFamily: 'Futura',
    fontSize: 16,
    fontWeight: '400',
    marginTop: '5%',
  },
  buttons: {
    flexDirection: 'row-reverse',
    margin: '7.5%',
  },
  button: {
    fontFamily: 'Futura',
    fontSize: 15,
    fontWeight: '600',
    marginHorizontal: '5%',
  },
});

export default NotificationCard;
