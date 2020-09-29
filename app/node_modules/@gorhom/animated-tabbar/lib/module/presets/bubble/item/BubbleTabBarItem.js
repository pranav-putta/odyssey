import React, { useMemo, memo } from 'react';
import { View, Text } from 'react-native';
import Animated from 'react-native-reanimated';
import { interpolateColor, useValue } from 'react-native-redash'; // @ts-ignore 😞

import isEqual from 'lodash.isequal';
import { DEFAULT_ITEM_INNER_SPACE, DEFAULT_ITEM_OUTER_SPACE } from '../constants';
import { styles } from './styles';
const {
  add,
  interpolate
} = Animated;

const BubbleTabBarItemComponent = ({
  animatedFocus,
  label,
  icon,
  background,
  labelStyle: labelStyleOverride,
  itemInnerSpace,
  itemOuterSpace,
  iconSize,
  isRTL
}) => {
  //#region extract props
  const {
    itemInnerVerticalSpace,
    itemInnerHorizontalSpace,
    itemOuterVerticalSpace,
    itemOuterHorizontalSpace
  } = useMemo(() => {
    let _itemInnerVerticalSpace,
        _itemInnerHorizontalSpace,
        _itemOuterVerticalSpace,
        _itemOuterHorizontalSpace = 0;

    if (typeof itemInnerSpace === 'number') {
      _itemInnerVerticalSpace = itemInnerSpace;
      _itemInnerHorizontalSpace = itemInnerSpace;
    } else {
      var _itemInnerSpace$verti, _itemInnerSpace$horiz;

      _itemInnerVerticalSpace = (_itemInnerSpace$verti = itemInnerSpace === null || itemInnerSpace === void 0 ? void 0 : itemInnerSpace.vertical) !== null && _itemInnerSpace$verti !== void 0 ? _itemInnerSpace$verti : DEFAULT_ITEM_INNER_SPACE;
      _itemInnerHorizontalSpace = (_itemInnerSpace$horiz = itemInnerSpace === null || itemInnerSpace === void 0 ? void 0 : itemInnerSpace.horizontal) !== null && _itemInnerSpace$horiz !== void 0 ? _itemInnerSpace$horiz : DEFAULT_ITEM_INNER_SPACE;
    }

    if (typeof itemOuterSpace === 'number') {
      _itemOuterVerticalSpace = itemOuterSpace;
      _itemOuterHorizontalSpace = itemOuterSpace;
    } else {
      var _itemOuterSpace$verti, _itemOuterSpace$horiz;

      _itemOuterVerticalSpace = (_itemOuterSpace$verti = itemOuterSpace === null || itemOuterSpace === void 0 ? void 0 : itemOuterSpace.vertical) !== null && _itemOuterSpace$verti !== void 0 ? _itemOuterSpace$verti : DEFAULT_ITEM_OUTER_SPACE;
      _itemOuterHorizontalSpace = (_itemOuterSpace$horiz = itemOuterSpace === null || itemOuterSpace === void 0 ? void 0 : itemOuterSpace.horizontal) !== null && _itemOuterSpace$horiz !== void 0 ? _itemOuterSpace$horiz : DEFAULT_ITEM_OUTER_SPACE;
    }

    return {
      itemInnerVerticalSpace: _itemInnerVerticalSpace,
      itemInnerHorizontalSpace: _itemInnerHorizontalSpace,
      itemOuterVerticalSpace: _itemOuterVerticalSpace,
      itemOuterHorizontalSpace: _itemOuterHorizontalSpace
    };
  }, [itemInnerSpace, itemOuterSpace]); //#endregion
  //#region variables

  const labelWidth = useValue(0);
  /**
   * @DEV
   * min width is calculated by adding outer & inner spaces
   * with the icon size.
   */

  const minWidth = useMemo(() => {
    return itemInnerHorizontalSpace * 2 + iconSize + itemOuterHorizontalSpace * 2;
  }, [itemInnerHorizontalSpace, itemOuterHorizontalSpace, iconSize]);
  /**
   * @DEV
   * max width is calculated by adding inner space with label width
   */

  const maxWidth = add(labelWidth, itemInnerHorizontalSpace, minWidth); //#endregion
  //#region styles

  const animatedIconColor = interpolateColor(animatedFocus, {
    inputRange: [0, 1],
    outputRange: [icon.inactiveColor, icon.activeColor]
  });
  const containerStyle = [styles.container, {
    paddingHorizontal: itemOuterHorizontalSpace,
    paddingVertical: itemOuterVerticalSpace,
    width: interpolate(animatedFocus, {
      inputRange: [0, 1],
      outputRange: [minWidth, maxWidth]
    })
  }];
  const contentContainerStyle = [styles.contentContainer, {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    paddingHorizontal: itemInnerHorizontalSpace,
    paddingVertical: itemInnerVerticalSpace,
    borderRadius: itemInnerVerticalSpace * 2 + iconSize,
    backgroundColor: interpolateColor(animatedFocus, {
      inputRange: [0, 1],
      outputRange: [background.inactiveColor, background.activeColor]
    })
  }];
  const labelContainerStyle = [styles.labelContainer, {
    opacity: interpolate(animatedFocus, {
      inputRange: [0.33, 1],
      outputRange: [0, 1]
    }),
    [isRTL ? 'left' : 'right']: interpolate(animatedFocus, {
      inputRange: [0, 1],
      outputRange: [0, itemInnerHorizontalSpace + itemOuterHorizontalSpace]
    })
  }];
  const iconContainerStyle = [styles.iconContainer, {
    minHeight: iconSize,
    minWidth: iconSize
  }];
  const labelStyle = [styles.label, labelStyleOverride]; //#endregion
  // callbacks

  const handleTextLayout = ({
    nativeEvent: {
      layout: {
        width
      }
    }
  }) => requestAnimationFrame(() => labelWidth.setValue(width)); // render


  const renderIcon = () => {
    const IconComponent = icon.component;
    return typeof IconComponent === 'function' ? IconComponent({
      animatedFocus,
      color: animatedIconColor,
      size: iconSize
    }) : /*#__PURE__*/React.createElement(IconComponent, {
      animatedFocus: animatedFocus,
      color: animatedIconColor,
      size: iconSize
    });
  };

  return /*#__PURE__*/React.createElement(Animated.View, {
    style: containerStyle
  }, /*#__PURE__*/React.createElement(Animated.View, {
    style: contentContainerStyle
  }, /*#__PURE__*/React.createElement(View, {
    style: iconContainerStyle
  }, renderIcon())), /*#__PURE__*/React.createElement(Animated.View, {
    style: labelContainerStyle
  }, /*#__PURE__*/React.createElement(Text, {
    onLayout: handleTextLayout,
    style: labelStyle,
    numberOfLines: 1
  }, label)));
};

const BubbleTabBarItem = /*#__PURE__*/memo(BubbleTabBarItemComponent, isEqual);
export default BubbleTabBarItem;
//# sourceMappingURL=BubbleTabBarItem.js.map