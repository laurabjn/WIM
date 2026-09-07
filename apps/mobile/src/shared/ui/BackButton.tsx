import React from 'react';
import {
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useThemeColors } from 'src/theme/ThemeContext';

type Props = {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  color?: string;
};

export function BackButton({ onPress, style, color }: Props) {
  const themeColors = useThemeColors();
  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      activeOpacity={0.7}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <ChevronLeft size={26} color={color ?? themeColors.text} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
