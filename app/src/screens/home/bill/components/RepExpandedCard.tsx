import React from 'react';
import Modal from 'react-native-modal';
import { View, StyleSheet, Image, Text } from 'react-native';

type Props = {
  visible: boolean;
  info: {
    name: string;
    image: string;
    phoneNumber: string;
    address: string;
  };
  dismiss: () => void;
};

type State = {};

class RepExpandedCard extends React.Component<Props, State> {
  render() {
    return (
      <Modal
        isVisible={this.props.visible}
        backdropOpacity={0.7}
        onBackdropPress={() => {
          this.props.dismiss();
        }}
        animationIn="zoomInUp"
        animationOut="fadeOut"
      >
        <View style={styles.container}>
          <Image source={{ uri: this.props.info.image }} style={styles.image} />
          <Text>{this.props.info.name}</Text>
          <Text>Phone Number: {this.props.info.phoneNumber}</Text>
          <Text>Office: {this.props.info.address}</Text>
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'space-evenly',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 20,
    height: '30%',
    width: '85%',
  },
  image: {
    width: 75,
    height: 75,
    borderRadius: 40,
  },
});

export default RepExpandedCard;
