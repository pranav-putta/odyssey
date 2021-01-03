import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Images } from '../assets/images';
import {
  Bill,
  BillAction,
  BillActionTag,
  classifyBillProgress,
} from '../models/Bill';
import Space from './Space';
interface Props {
  bill: Bill;
}
interface State {}
class BillProgressBar extends React.Component<Props, State> {
  private progressElements: string[] = [];

  constructor(props: Props) {
    super(props);

    // construct actions
    this.progressElements = classifyBillProgress(props.bill);
  }
  render() {
    return (
      <View style={styles.container}>
        <Item icon={Images.chamber} text={this.progressElements[0]} />
        <Item icon={Images.chamber} text={this.progressElements[1]} />
        <Item icon={Images.law} text={this.progressElements[2]} />
        <View style={styles.progress}>
          <View style={styles.progressHighlight} />
        </View>
      </View>
    );
  }
}

function Item(props: { icon: any; text: string }) {
  if (!props.text) {
    return null;
  }
  return (
    <>
      <View style={styles.item}>
        <View style={styles.imageContainer}>
          <Image source={props.icon} style={styles.itemImage} />
        </View>
        <Space height={5} />
        <Text style={styles.itemText}>{props.text}</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  item: {
    alignItems: 'center',
  },
  imageContainer: {
    padding: 0,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemImage: {
    width: 40,
    height: 40,
  },
  itemText: {
    fontSize: 15,
    fontFamily: 'Futura',
    maxWidth: 100,
    textAlign: 'center',
  },
  progress: {
    position: 'absolute',
    width: '100%',
    top: '30%',
    backgroundColor: '#1976d2',
    borderWidth: 2,
    height: 15,
    zIndex: -1,
    borderRadius: 15,
  },
  progressHighlight: {
    bottom: 1,
    width: '90%',
    backgroundColor: 'white',
    height: 5,
    position: 'absolute',
    marginLeft: '5%',
    borderRadius: 25,
    opacity: 0.4,
  },
});
export default BillProgressBar;
