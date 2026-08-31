import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';

type Props = BottomTabBarProps & { unreadCount?: number };

export function CustomTabBar({
  state,
  descriptors,
  navigation,
  unreadCount = 0,
}: Props) {
  const themeColors = useThemeColors();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);
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
                size={21}
                color={themeColors.text}
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
                size={18}
                color={themeColors.text}
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
              size={17}
              color={themeColors.text}
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
                size={20}
                color={themeColors.text}
              />

              {unreadCount > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              ) : null}
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
                size={21}
                color={themeColors.text}
              />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
  safeArea: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },

  outer: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },

  inner: {
    height: 66,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },

  sideButton: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.danger,
    borderWidth: 2,
    borderColor: c.surface,
  },

  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  iconBubbleActive: {
    backgroundColor: c.surfaceAlt,
  },

  searchPill: {
    height: 44,
    minWidth: 124,
    maxWidth: 138,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },

  searchPillActive: {
    backgroundColor: c.surfaceAlt,
  },

  searchIcon: {
    marginRight: 6,
  },

  searchText: {
    fontSize: 11,
    fontWeight: '500',
    color: c.text,
    maxWidth: 72,
  },
});