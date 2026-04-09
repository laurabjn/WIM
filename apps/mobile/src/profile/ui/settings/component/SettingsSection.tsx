import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Props = {
  title: string;
  children: React.ReactNode;
};

export function SettingsSection({ title, children }: Props) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 18,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F1F1F',
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
  },
});