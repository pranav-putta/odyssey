import React from 'react';
import { StyleSheet, Image, View, Text } from 'react-native';
import Dash from 'react-native-dash';
import { colors } from '../../../../assets';
type Props = {
  name: string;
  comment: string;
  image: string;
  indent?: number;
};

type State = {};

class CommentItem extends React.Component<Props, State> {
  static defaultProps = {
    indent: 0,
  };

  constructor(props: Props) {
    super(props);
  }

  render() {
    let indent = this.props.indent || 0;
    let margin = indent * 5 + '%';
    let width = 92.5 - indent * 10 + '%';

    return (
      <View style={[styles.container, { width: width }]}>
        {indent > 0 && (
          <Dash
            dashGap={3}
            dashColor={colors.darkGray}
            dashLength={2}
            dashThickness={1}
            style={{
              width: 1,
              flexDirection: 'column',
              marginLeft: margin,
              marginRight: '5%',
            }}
          />
        )}
        <Image style={styles.image} source={{ uri: this.props.image }} />
        <View style={styles.commentContainer}>
          <Text style={{ fontWeight: 'bold' }}>{this.props.name}</Text>
          <Text>{this.props.comment}</Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginTop: '5%',
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 40,
  },
  commentContainer: {
    marginLeft: '2.5%',
    justifyContent: 'space-evenly',
  },
});

export default CommentItem;
