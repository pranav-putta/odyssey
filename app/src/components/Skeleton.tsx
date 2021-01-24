import React from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import tinycolor from 'tinycolor2';
import { colors } from '../assets';
import Space from './Space';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

export const backgroundColor = '#eeeeee';
export const boxColor = '#e0e0e0';

interface Props {
  loading: boolean;
  styles?: StyleProp<ViewStyle>;
  skeleton: () => JSX.Element;
}
interface State {}

export default class Skeleton extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }
  render() {
    if (this.props.loading) {
      return <View style={this.props.styles}>{this.props.skeleton()}</View>;
    } else {
      return this.props.children;
    }
  }
}

function Shimmer(props: { style: StyleProp<ViewStyle> }) {
  let animation = new Animated.Value(0);
  let translation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['-400%', '400%'],
  });

  let lighten = (num: number) => {
    return tinycolor(boxColor).lighten(num).setAlpha(0.5).toHexString();
  };

  Animated.loop(
    Animated.timing(animation, {
      useNativeDriver: true,
      toValue: 1,
      duration: 2000,
    }),
    {}
  ).start();
  return (
    <View style={[props.style, { overflow: 'hidden' }]}>
      <Animated.View
        style={{
          position: 'absolute',
          height: '100%',
          width: '100%',
          transform: [{ translateX: translation }],
        }}
      >
        <LinearGradient
          colors={[lighten(1), lighten(2), lighten(3), lighten(2), lighten(1)]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1, height: '100%', width: '100%' }}
        />
      </Animated.View>
    </View>
  );
}

export module Skeletons {
  const Card = () => {
    return (
      <View style={{ flexDirection: 'row', flex: 1, margin: 5 }}>
        <Shimmer
          style={{
            height: '100%',
            flex: 1,
            backgroundColor: boxColor,
            borderRadius: 5,
          }}
        />
        <View
          style={{
            height: '100%',
            flex: 3.5,
            marginLeft: 20,
            paddingTop: 5,
            paddingBottom: 17.5,
          }}
        >
          <Shimmer
            style={{
              flex: 1,
              backgroundColor: boxColor,
              borderRadius: 10,
              width: '90%',
            }}
          />
          <View style={{ flex: 0.75 }} />
          <Shimmer
            style={{
              flex: 1,
              width: '65%',
              backgroundColor: boxColor,
              borderRadius: 10,
            }}
          />
        </View>
      </View>
    );
  };
  export function RepCard() {
    return (
      <View>
        <View style={[styles.repCardContainer]}>
          {Card()}
          <Space height={5} />
          {Card()}
        </View>
      </View>
    );
  }

  export function BillInfo() {
    const { width, height } = Dimensions.get('screen');

    return (
      <SafeAreaView style={{ height: '100%' }}>
        <Shimmer
          style={{
            height: '25%',
            backgroundColor: boxColor,
            borderRadius: 10,
            margin: 10,
          }}
        />
        <FlatList
          scrollEnabled={false}
          keyExtractor={(item, index) => item.toString()}
          data={[1, 2, 3, 4, 5]}
          renderItem={() => (
            <View style={{ height: height * 0.1, margin: 10 }}>{Card()}</View>
          )}
        />
      </SafeAreaView>
    );
  }

  export function Comment() {
    return (
      <View>
        <View style={[styles.commentContainer]}>
          {Card()}
          <Space height={5} />
          {Card()}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  repCardContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: backgroundColor,
    borderRadius: 5,
    padding: 5,
  },
  commentContainer: {
    width: '100%',
    height: 150,
    backgroundColor: backgroundColor,
    borderRadius: 5,
    padding: 5,
  },
});
