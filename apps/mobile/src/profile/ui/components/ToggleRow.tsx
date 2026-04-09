import { TouchableOpacity, StyleSheet, Text } from "react-native";

type ToggleRowProps = {
  label: string;
  value: boolean;
  onPress: () => void;
};

export function ToggleRow({ label, value, onPress }: ToggleRowProps) {
  return (
    <TouchableOpacity
      style={[styles.toggleRow, value && styles.toggleRowSelected]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text style={[styles.toggleRowText, value && styles.toggleRowTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  toggleRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 10,
  },
  toggleRowSelected: {
    backgroundColor: '#4ECC9A',
    borderColor: '#4ECC9A',
  },
  toggleRowText: {
    fontSize: 14,
    color: '#1F1F1F',
    fontWeight: '500',
  },
  toggleRowTextSelected: {
    color: '#FFFFFF',
  },
});