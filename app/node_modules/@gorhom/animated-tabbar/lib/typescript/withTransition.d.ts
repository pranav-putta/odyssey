import Animated from 'react-native-reanimated';
import type { TabBarConfigurableProps } from './types';
interface withTransitionProps extends Required<Pick<TabBarConfigurableProps, 'duration' | 'easing'>> {
    index: number;
    selectedIndex: Animated.Value<number>;
}
export declare const withTransition: ({ index, selectedIndex, duration, easing, }: withTransitionProps) => Animated.Node<number>;
export {};
