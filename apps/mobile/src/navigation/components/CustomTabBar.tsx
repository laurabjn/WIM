import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const currentRouteName = state.routes[state.index]?.name;

  function navigateTo(routeName: string) {
    const targetRoute = state.routes.find((route) => route.name === routeName);
    if (!targetRoute) return;

    const event = navigation.emit({
      type: 'tabPress',
      target: targetRoute.key,
      canPreventDefault: true,
    });

    if (currentRouteName !== routeName && !event.defaultPrevented) {
      navigation.navigate(routeName as never);
    }
  }

  const isHomeFocused = currentRouteName === 'HomeTab';
  const isExchangeFocused = currentRouteName === 'ExchangeTab';
  const isSearchFocused = currentRouteName === 'SearchTab';
  const isMessagesFocused = currentRouteName === 'MessagesTab';
  const isProfileFocused = currentRouteName === 'ProfileTab';

  const searchLabel =
    typeof descriptors[
      state.routes.find((r) => r.name === 'SearchTab')?.key ?? ''
    ]?.options?.title === 'string'
      ? (descriptors[
          state.routes.find((r) => r.name === 'SearchTab')?.key ?? ''
        ]?.options?.title as string)
      : 'Recherche';

  return (
    <SafeAreaView edges={['bottom']} style={styles.safeArea}>
      <View style={styles.outer}>
        <View style={styles.inner}>
          <TouchableOpacity
            onPress={() => navigateTo('HomeTab')}
            activeOpacity={0.85}
            style={styles.sideButton}
          >
            <View style={[styles.iconBubble, isHomeFocused && styles.iconBubbleActive]}>
              <Ionicons
                name={isHomeFocused ? 'home' : 'home-outline'}
                size={18}
                color="#1F1F1F"
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigateTo('ExchangeTab')}
            activeOpacity={0.85}
            style={styles.sideButton}
          >
            <View style={[styles.iconBubble, isExchangeFocused && styles.iconBubbleActive]}>
              <Ionicons
                name={isExchangeFocused ? 'swap-horizontal' : 'swap-horizontal-outline'}
                size={15}
                color="#1F1F1F"
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigateTo('SearchTab')}
            activeOpacity={0.9}
            style={[styles.searchPill, isSearchFocused && styles.searchPillActive]}
          >
            <Ionicons
              name={isSearchFocused ? 'search' : 'search-outline'}
              size={16}
              color="#1F1F1F"
              style={styles.searchIcon}
            />
            <Text style={styles.searchText} numberOfLines={1}>
              {searchLabel}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigateTo('MessagesTab')}
            activeOpacity={0.85}
            style={styles.sideButton}
          >
            <View style={[styles.iconBubble, isMessagesFocused && styles.iconBubbleActive]}>
              <Ionicons
                name={isMessagesFocused ? 'chatbubbles' : 'chatbubbles-outline'}
                size={17}
                color="#1F1F1F"
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigateTo('ProfileTab')}
            activeOpacity={0.85}
            style={styles.sideButton}
          >
            <View style={[styles.iconBubble, isProfileFocused && styles.iconBubbleActive]}>
              <Ionicons
                name={isProfileFocused ? 'person' : 'person-outline'}
                size={18}
                color="#1F1F1F"
              />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },

  outer: {
    paddingHorizontal: 10,
    paddingBottom: 8,
  },

  inner: {
    height: 58,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },

  sideButton: {
    width: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconBubble: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F4F4F4',
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconBubbleActive: {
    backgroundColor: '#ECECEC',
  },

  searchPill: {
    height: 38,
    minWidth: 118,
    maxWidth: 128,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },

  searchPillActive: {
    backgroundColor: '#FAFAFA',
  },

  searchIcon: {
    marginRight: 6,
  },

  searchText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#1F1F1F',
    maxWidth: 72,
  },
});