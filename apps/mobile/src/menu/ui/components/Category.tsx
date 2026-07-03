import { TouchableOpacity, View, Text, StyleSheet } from "react-native";

export function Category({
  icon,
  label,
  color,
  onPress
}: {
  icon: React.ReactNode;
  label: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.category} onPress={onPress}>
      <View style={[styles.categoryIcon, { backgroundColor: color }]}>
        {icon}
      </View>
      <Text style={styles.categoryLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  category: {
    alignItems: 'center',
    width: 72,
  },
  categoryIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
});