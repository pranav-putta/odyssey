import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Icon } from 'react-native-elements';
import Space from './Space';
interface Props {
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  icon?: {
    name: string;
    type: string;
    color?: string;
    size?: number;
  };
  label?: string;
  color?: string;
}
interface State {}
class Button extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }
  render() {
    const { style, textStyle, icon, label, color } = this.props;
    return (
      <TouchableOpacity
        style={[styles.container, style, { backgroundColor: color }]}
      >
        {icon ? (
          <>
            <Icon
              name={icon.name}
              type={icon.type}
              color={icon.color}
              size={icon.size}
            />
            <Space width={5} />
          </>
        ) : null}
        <Text style={[styles.text, textStyle]}>{label}</Text>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 10,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontFamily: 'Futura',
    color: 'white',
    fontSize: 16,
  },
});
export default Button;
