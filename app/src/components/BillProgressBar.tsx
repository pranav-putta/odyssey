import dateFormat from 'dateformat';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors } from '../assets';
import { Images } from '../assets/images';
import { Representative } from '../models';
import {
  Bill,
  BillAction,
  BillActionTag,
  BillHandler,
  BillProgressAction,
} from '../models/Bill';
import store from '../redux/store';
import Space from './Space';
interface Props {
  bill: Bill;
}
interface State {}

class BillProgressBar extends React.PureComponent<Props, State> {
  private progressElements: BillProgressAction[] = [];

  constructor(props: Props) {
    super(props);

    // construct actions
    this.progressElements = BillHandler.constructTimeline(props.bill);
  }
  render() {
    return (
      <View style={styles.container}>
        {this.progressElements.map((item) => (
          <>
            <Item
              action={item.action}
              text={item.text}
              image={item.image}
            />
          </>
        ))}
      </View>
    );
  }
}

function Item(props: {
  action: BillAction;
  text: string;
  image: any;
}) {
  const { action, text, image } = props;
  let date = dateFormat(action.Date, 'mmm dS, yyyy');
  let space = 10;

  return (
    <View style={{ flexDirection: 'row' }}>
      <Text
        style={{
          marginTop: space,
          fontFamily: 'Futura',
          color: colors.darkGray,
          width: '22.5%',
        }}
      >
        {date}
      </Text>
      <View
        style={{
          width: 0.25,
          backgroundColor: colors.darkGray,
          transform: [{ translateY: 5 }],
        }}
      />
      <Space width={10} />
      <Image
        source={image}
        style={{ width: 30, height: 30, marginTop: space }}
      />
      <View style={{ flex: 1, marginLeft: '10%' }}>
        <Text
          style={{
            fontFamily: 'Futura',
            fontSize: 16,
            marginTop: space,
          }}
        >
          {text}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
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
