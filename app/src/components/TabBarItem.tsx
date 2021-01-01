import React from 'react';
import {
  StyleSheet,
  View,
  StyleProp,
  ViewStyle,
  TouchableOpacity,
  Animated,
  Text,
  Easing,
} from 'react-native';
import { colors } from '../assets';
import { Icon } from 'react-native-elements';

type TabItemProps = {
  style?: StyleProp<ViewStyle>;
  icon: {
    type: string;
    name: string;
  };
  label: string;
  color: string;
  textColor: string;
  width: number;
  tkey: string;
  active: boolean;
  onPress: () => void;
};

type TabItemState = {
  // if the current tab is expanded
  clicked: boolean;
};

class TabBarItem extends React.Component<TabItemProps, TabItemState> {
  private animation: Animated.Value;
  private labelOverlayTranslation: Animated.AnimatedInterpolation;
  private tabTranslation: Animated.AnimatedInterpolation;
  private iconScale: Animated.AnimatedInterpolation;

  private show: Animated.CompositeAnimation;
  private hide: Animated.CompositeAnimation;

  constructor(props: TabItemProps) {
    super(props);
    this.state = {
      clicked: props.active,
    };

    this.animation = new Animated.Value(props.active ? 1 : 0);
    this.toggleClick = this.toggleClick.bind(this);
    this.labelOverlayTranslation = this.animation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '100%'],
    });
    this.tabTranslation = this.animation.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: ['10%', '0%', '0%'],
    });
    this.iconScale = this.animation.interpolate({
      inputRange: [0, 0.4, 0.8],
      outputRange: [1, 1.25, 1],
      extrapolate: 'clamp',
    });
    this.show = Animated.timing(this.animation, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    });
    this.hide = Animated.timing(this.animation, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    });
  }
  componentDidMount() {}

  componentDidUpdate() {
    if (this.props.active != this.state.clicked) {
      // active status has changed
      if (this.props.active) {
        this.show.start(() => {
          this.toggleClick();
        });
      } else {
        this.hide.start(() => {
          this.toggleClick();
        });
      }
    }
  }

  toggleClick() {
    this.setState({ clicked: this.props.active });
  }

  render() {
    // destructure for convenience
    const { textColor, icon, label, tkey, active, onPress } = this.props;
    let color = active
      ? colors.votingBackgroundColor
      : colors.textInputPlaceholderColor;
    return (
      <TouchableOpacity
        style={styles.container}
        onPress={() => {
          if (!active) {
            onPress();
          }
        }}
      >
        <View style={styles.tab}>
          <Animated.View
            style={{
              zIndex: 15,
              transform: [
                { translateY: this.tabTranslation },
                { scale: this.iconScale },
              ],
            }}
          >
            <Icon type={icon.type} name={icon.name} size={28} color={color} />
          </Animated.View>
          <View>
            <Text style={[styles.label, { color }]}>{label}</Text>
            <Animated.View
              style={[
                styles.labelOverlay,
                {
                  transform: [
                    { translateY: this.labelOverlayTranslation },
                    { rotateZ: '10deg' },
                  ],
                },
              ]}
            ></Animated.View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    paddingTop: '4%',
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '60%',
    borderRadius: 5,
  },
  label: {
    fontFamily: 'Futura',
    fontSize: 16,
    marginTop: 3,
  },
  labelOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
    alignSelf: 'center',
  },
});

export default TabBarItem;
