import React from 'react';
import { View } from 'react-native';
function Space(props: { width?: string | number; height?: string | number }) {
  return <View style={{ width: props.width, height: props.height }} />;
}

export default Space;
