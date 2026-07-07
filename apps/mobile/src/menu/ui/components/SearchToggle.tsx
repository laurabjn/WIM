import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated
} from 'react-native';

type Props = {
  quickSearch: boolean;
  onToggle: () => void;
  exploreLabel: string;
  quickSearchLabel: string;
};

const CIRCLE_SIZE = 24;
const TOGGLE_PADDING = 5;

export function SearchToggle({
  quickSearch,
  onToggle,
  exploreLabel,
  quickSearchLabel,
}: Props) {
  const progress = useRef(new Animated.Value(quickSearch ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: quickSearch ? 1 : 0,
      duration: 220,
      useNativeDriver: false,
    }).start();
  }, [quickSearch, progress]);

  const backgroundColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['#9BEBCB', '#25AEEB'],
  });

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 130],
  });

  return (
    <View style={styles.header}>
      <Text style={[styles.headerText, !quickSearch && styles.headerTextActive]}>
        {exploreLabel}
      </Text>

      <TouchableOpacity activeOpacity={0.8} onPress={onToggle}>
        <Animated.View style={[styles.toggle, { backgroundColor }]}>
          <Animated.View
            style={[
              styles.toggleCircle,
              {
                transform: [{ translateX }],
              },
            ]}
          />
        </Animated.View>
      </TouchableOpacity>

      <Text style={[styles.headerText, quickSearch && styles.headerTextActive]}>
        {quickSearchLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  headerText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#555',
  },
  headerTextActive: {
    color: '#000',
    fontWeight: '800',
  },
  toggle: {
    width: 164,
    height: 34,
    borderRadius: 20,
    justifyContent: 'center',
    paddingHorizontal: TOGGLE_PADDING,
  },
  toggleCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: '#fff',
  },
});