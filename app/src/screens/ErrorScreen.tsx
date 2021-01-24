import React from 'react';
import { View, Text } from 'react-native';

export function ErrorScreen(props: { message?: string }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>{props.message ?? 'Something went wrong'}</Text>
    </View>
  );
}
