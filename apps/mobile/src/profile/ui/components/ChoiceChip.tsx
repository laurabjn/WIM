import { TouchableOpacity, StyleSheet, Text } from "react-native";

type ChoiceChipProps = {
  label: string;
  subtitle?: string;
  selected: boolean;
  onPress: () => void;
};

export function ChoiceChip({ label, subtitle, selected, onPress }: ChoiceChipProps) {
  return (
    <TouchableOpacity
      style={[styles.choiceChip, selected && styles.choiceChipSelected]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text style={[styles.choiceChipLabel, selected && styles.choiceChipLabelSelected]}>
        {label}
      </Text>
      {subtitle ? (
        <Text
          style={[
            styles.choiceChipSubtitle,
            selected && styles.choiceChipSubtitleSelected,
          ]}
        >
          {subtitle}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  choiceChip: {
    minWidth: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    paddingHorizontal: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceChipSelected: {
    backgroundColor: '#4ECC9A',
    borderColor: '#4ECC9A',
  },
  choiceChipLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F1F1F',
    textAlign: 'center',
  },
  choiceChipLabelSelected: {
    color: '#FFFFFF',
  },
  choiceChipSubtitle: {
    fontSize: 11,
    color: '#7A7A7A',
    marginTop: 4,
  },
  choiceChipSubtitleSelected: {
    color: '#EAFBF4',
  },
});