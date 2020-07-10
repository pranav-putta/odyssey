import React from 'react';
import {View, Text, StyleSheet, ActivityIndicator} from 'react-native';
import {colors} from '../assets';
import Modal from 'react-native-modal';
import {WaveIndicator} from 'react-native-indicators';

type State = {};

type Props = {
  visible: boolean;
};

class ProgressHUD extends React.Component<Props, State> {
  render() {
    return (
      <Modal isVisible={this.props.visible} backdropOpacity={0.4}>
        <View style={styles.container}>
          <View style={styles.dialog}>
            <WaveIndicator color={colors.primary} size={75} />
          </View>
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
  },
  dialog: {
    borderRadius: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    width: 140,
    height: 140,
  },
});

export default ProgressHUD;
