import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';

export type Onglet = {
  cle: string;
  libelle: string;
};

type Props = {
  tabs: Onglet[];
  activeTab: string;
  onChange: (cle: string) => void;
};

export function HomeTabs({ tabs, activeTab, onChange }: Props) {
  const themeColors = useThemeColors();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="never"
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.tabsContent}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.cle;

        return (
          <TouchableOpacity
            key={tab.cle}
            onPress={() => onChange(tab.cle)}
            style={[styles.tab, isActive && styles.activeTab]}
          >
            <Text style={[styles.tabText, isActive && styles.activeTabText]}>
              {tab.libelle}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
  tabsContent: {
    paddingHorizontal: 10,
    gap: 8,
    marginTop: 8,
    marginBottom: 18,
  },

  tab: {
    paddingHorizontal: 12,
    height: 28,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },

  activeTab: {
    backgroundColor: '#58D6B2',
  },

  tabText: {
    fontSize: 11,
    fontWeight: '700',
    color: c.text,
  },

  activeTabText: {
    color: '#FFFFFF',
  },
});