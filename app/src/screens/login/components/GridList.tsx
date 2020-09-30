import { types } from '@babel/core';
import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';

interface Props<DataType> {
  item: (data: DataType) => React.ReactElement;
  data: DataType[];
  n: number;
}

interface State {}

export class GridList<DataType> extends React.Component<
  Props<DataType>,
  State
> {
  Block = (props: { data: DataType }) => {
    return this.props.item(props.data);
  };
  BlockRow = (props: { data: DataType[] }) => {
    let emptyViews = [];
    for (let i = props.data.length; i < this.props.n; i++) {
      emptyViews.push(<View style={{ flex: 1 }} />);
    }
    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-evenly',
        }}
      >
        {props.data.map((val) => {
          return this.props.item(val);
        })}
        {emptyViews}
      </View>
    );
  };
  render() {
    let newArr = [];
    while (this.props.data.length > 0) {
      newArr.push(this.props.data.splice(0, this.props.n));
    }
    return (
      <View style={styles.container}>
        {newArr.map((arr) => {
          return <this.BlockRow data={arr} />;
        })}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
  },
});
