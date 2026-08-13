import React from 'react';
import {
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { ChevronLeft } from 'lucide-react-native';

type Props = {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  color?: string;
};

// L'application melangeait quatre fleches de retour : deux icones et deux
// caracteres typographiques. Celle-ci est la seule.
export function BackButton({ onPress, style, color = '#111111' }: Props) {
  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      activeOpacity={0.7}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <ChevronLeft size={26} color={color} />
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
