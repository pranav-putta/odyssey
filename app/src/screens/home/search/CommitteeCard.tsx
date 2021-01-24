import { BlurView } from '@react-native-community/blur';
import React from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import tinycolor from 'tinycolor2';
import { Bill } from '../../../models/Bill';
import { Committee } from '../../../redux/models/committee';
import { Config } from '../../../util/Config';

const { width, height } = Dimensions.get('screen');

const CommitteeCardCardSpecs = {
  width: width * 0.35,
  height: height * 0.15,
  spacingHorizontal: 15,
};

export default function CommitteeCard(props: {
  committee: Committee;
  onPress: () => void;
}) {
  const { committee } = props;
  let category = Config.getSmallTopics()[committee.category];
  let isDark = tinycolor(category.color).isDark();
  let committeeStyles =
    Config.getCommitteeData()[committee.id.toString()] ?? {};

  let name = committee.name.trim();
  if (name.charAt(0) == '-') {
    name = name
      .replace('-', ' ')
      .trim()
      .replace('Subcommittee on', '')
      .replace('Sub. on', '');
  }

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: committeeStyles.color ?? category.color },
      ]}
      onPress={props.onPress}
    >
      {committeeStyles && committeeStyles.image ? (
        <Image
          source={{
            uri: committeeStyles.image,
          }}
          style={{ position: 'absolute', width: '100%', height: '100%' }}
        />
      ) : null}

      <View style={[styles.caption]}>
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            opacity: committeeStyles.opacity ?? 0.5,
            backgroundColor: 'white',
          }}
        />
        <Text
          style={{
            color: committeeStyles.dark ?? isDark ? 'white' : 'black',
            textAlign: 'center',
            alignSelf: 'center',
            fontFamily: 'Futura',
            fontSize: 16,
            zIndex: 2,
          }}
          adjustsFontSizeToFit={true}
        >
          {name}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CommitteeCardCardSpecs.width,
    height: CommitteeCardCardSpecs.height,
    marginRight: CommitteeCardCardSpecs.spacingHorizontal,
    borderRadius: 10,
    overflow: 'hidden',
  },
  caption: {
    position: 'absolute',
    bottom: -2,
    width: '100%',
    height: CommitteeCardCardSpecs.height * 0.65,
    padding: 10,
    justifyContent: 'center',
  },
});
