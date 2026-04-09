import { TouchableOpacity, StyleSheet, Text } from "react-native";

type NumberChipProps = {
  value: number;
  selected: boolean;
  onPress: () => void;
};

export function NumberChip({ value, selected, onPress }: NumberChipProps) {
  return (
    <TouchableOpacity
      style={[styles.numberChip, selected && styles.numberChipSelected]}
      onPress={onPress}
    >
      <Text style={[styles.numberChipText, selected && styles.numberChipTextSelected]}>
        {value}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  numberChip: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberChipSelected: {
    backgroundColor: '#4ECC9A',
    borderColor: '#4ECC9A',
  },
  numberChipText: {
    fontSize: 14,
    color: '#1F1F1F',
    fontWeight: '600',
  },
  numberChipTextSelected: {
    color: '#FFFFFF',
  },
});