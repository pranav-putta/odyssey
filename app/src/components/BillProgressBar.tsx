import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  Bill,
  BillAction,
  BillActionTag,
  classifyBillProgress,
} from '../models/Bill';
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
        <Text>Progress</Text>
        {this.progressElements.map((el) => (
          <Text>{el}</Text>
        ))}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
  },
});
export default BillProgressBar;
