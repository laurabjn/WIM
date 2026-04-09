import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Props = {
  languages?: string[];
};

export function LanguagePills({ languages = [] }: Props) {
  if (!Array.isArray(languages) || languages.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {languages.map((language) => (
        <View key={language} style={styles.pill}>
          <Text style={styles.pillText}>{language}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    marginTop: 10,
  },
  pill: {
    backgroundColor: '#F2F2F2',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pillText: {
    fontSize: 12,
    color: '#444',
  },
});