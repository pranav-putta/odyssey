import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, ScrollView } from 'react-native';
import HTML from 'react-native-render-html';
import Modal from 'react-native-modal';
import { Notification, NotificationType } from '../redux/models';
import { StorageService } from '../redux/storage';
import store from '../redux/store';
// @ts-ignore

type State = {};

type Props = {
  notification?: Notification;
};

const { width, height } = Dimensions.get('screen');

const DialogSpecs = {
  width: width * 0.9,
  height: height * 0.75,
};

class NotificationModal extends React.Component<Props, State> {
  render() {
    let view = (
      <HTMLNotification content={this.props.notification?.content ?? ''} />
    );
    return (
      <Modal
        isVisible={this.props.notification && !this.props.notification.seen}
        presentationStyle={'overFullScreen'}
        animationIn={'slideInUp'}
      >
        <View style={styles.container}>{view}</View>
      </Modal>
    );
  }
}

function HTMLNotification(props: { content: string }) {
  return (
    <View style={styles.htmlDialog}>
      <ScrollView bounces={false}>
        <HTML
          containerStyle={{ flex: 1 }}
          source={{ html: props.content }}
          contentWidth={width}
          onLinkPress={(_, href) => {
            if (href == 'dismiss') {
              store.dispatch(StorageService.update({ notifications: [] }));
            }
          }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  htmlDialog: {
    borderRadius: 10,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    width: DialogSpecs.width,
    height: DialogSpecs.height,
    overflow: 'hidden',
  },
});

export default NotificationModal;
