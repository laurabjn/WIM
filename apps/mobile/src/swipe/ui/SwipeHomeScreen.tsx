import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Info, X, Check } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { swipeHomesMock } from '../infrastructure/mocks/swipeHomeMocks';
import { SwipeHomeCard } from './components/SwipehomCard';
import { useTranslation } from 'react-i18next';

export function SwipeHomeScreen() {
  const { t } = useTranslation(['common', "swipe"]);
  const [index, setIndex] = useState(0);
  const home = swipeHomesMock[index];

  function next() {
    setIndex((current) => current + 1);
  }

  if (!home) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.empty}>{t('swipe:noMoreHome')}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <SwipeHomeCard home={home} />

      <View style={styles.actions}>
        <TouchableOpacity style={styles.roundButton} onPress={next}>
          <X size={28} color="#E74C3C" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.moreButton}>
          <Info size={16} color="#111" />
          <Text style={styles.moreText}>{t('common:seeMore')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.roundButton} onPress={next}>
          <Check size={28} color="#2ECC71" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  empty: {
    marginTop: 80,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
    color: '#555',
  },
  actions: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roundButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  moreButton: {
    flex: 1,
    height: 46,
    marginHorizontal: 14,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  moreText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111',
  },
});