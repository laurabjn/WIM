import React, {
  RefObject,
  useRef,
} from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  PanResponder,
  StyleSheet,
  Text,
  View,
  ViewToken,
} from 'react-native';
import { Home } from '@wim/shared/home/home.type';
import { SearchResultCard } from './SearchResultCard';
import { useTranslation } from 'react-i18next';

type Props = {
  homes: Home[];
  loading: boolean;
  selectedHomeId: string | null;
  sheetY: Animated.Value;
  listRef: RefObject<FlatList<Home> | null>;
  collapsedPosition: number;
  expandedPosition: number;
  onMoveSheet: (position: number) => void;
  onVisibleHomeChange: (home: Home) => void;
  onPressHome: (home: Home) => void;
};

export function SearchResultsSheet({
  homes,
  loading,
  selectedHomeId,
  sheetY,
  listRef,
  collapsedPosition,
  expandedPosition,
  onMoveSheet,
  onVisibleHomeChange,
  onPressHome,
}: Props) {
  const { t } = useTranslation('search')
  const lastSheetY = useRef(collapsedPosition);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dy) > 5,

      onPanResponderMove: (_, gesture) => {
        const next =
          lastSheetY.current + gesture.dy;

        if (
          next >= expandedPosition &&
          next <= collapsedPosition
        ) {
          sheetY.setValue(next);
        }
      },

      onPanResponderRelease: (_, gesture) => {
        const expand =
          gesture.dy < -40 || gesture.vy < -0.5;

        const collapse =
          gesture.dy > 40 || gesture.vy > 0.5;

        if (expand) {
          lastSheetY.current = expandedPosition;
          onMoveSheet(expandedPosition);
          return;
        }

        if (collapse) {
          lastSheetY.current = collapsedPosition;
          onMoveSheet(collapsedPosition);
          return;
        }

        const middle =
          (collapsedPosition + expandedPosition) / 2;

        const current =
          lastSheetY.current + gesture.dy;

        const destination =
          current < middle
            ? expandedPosition
            : collapsedPosition;

        lastSheetY.current = destination;
        onMoveSheet(destination);
      },
    }),
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 55,
  }).current;

  const onViewableItemsChanged = useRef(
    ({
      viewableItems,
    }: {
      viewableItems: ViewToken<Home>[];
    }) => {
      const home = viewableItems.find(
        (item) => item.isViewable,
      )?.item;

      if (home) {
        onVisibleHomeChange(home);
      }
    },
  ).current;

  return (
    <Animated.View
      style={[
        styles.sheet,
        {
          transform: [{ translateY: sheetY }],
        },
      ]}
    >
      <View
        style={styles.handleContainer}
        {...panResponder.panHandlers}
      >
        <View style={styles.dragBar} />

        <Text style={styles.resultsCount}>
          {homes.length} {t('results')}
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} />
      ) : (
        <FlatList
          ref={listRef}
          data={homes}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          viewabilityConfig={viewabilityConfig}
          onViewableItemsChanged={
            onViewableItemsChanged
          }
          contentContainerStyle={styles.results}
          renderItem={({ item, index }) => {
            const selected =
              item.id === selectedHomeId;

            return (
              <View
                style={[
                  styles.resultWrapper,
                  selected &&
                    styles.resultWrapperSelected,
                ]}
              >
                <View
                  style={[
                    styles.numberBadge,
                    selected &&
                      styles.numberBadgeSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.numberText,
                      selected &&
                        styles.numberTextSelected,
                    ]}
                  >
                    {index + 1}
                  </Text>
                </View>

                <SearchResultCard
                  home={item}
                  onPress={() => onPressHome(item)}
                />
              </View>
            );
          }}
          onScrollToIndexFailed={(info) => {
            listRef.current?.scrollToOffset({
              offset:
                info.averageItemLength * info.index,
              animated: true,
            });
          }}
        />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    overflow: 'hidden',
    elevation: 12,
  },

  handleContainer: {
    paddingTop: 3,
    paddingBottom: 6,
  },

  dragBar: {
    alignSelf: 'center',
    width: 42,
    height: 5,
    marginTop: 3,
    borderRadius: 10,
    backgroundColor: '#111',
  },

  resultsCount: {
    marginTop: 7,
    marginBottom: 4,
    textAlign: 'center',
    fontSize: 12,
    color: '#666',
  },

  loader: {
    marginTop: 30,
  },

  results: {
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 140,
  },

  resultWrapper: {
    position: 'relative',
    marginBottom: 16,
    padding: 3,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'transparent',
  },

  resultWrapperSelected: {
    borderColor: '#25AEEB',
    backgroundColor: '#F4FBFF',
  },

  numberBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    zIndex: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#25AEEB',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },

  numberBadgeSelected: {
    backgroundColor: '#087EBE',
    borderColor: '#fff',
  },

  numberText: {
    color: '#087EBE',
    fontSize: 13,
    fontWeight: '900',
  },

  numberTextSelected: {
    color: '#fff',
  },
});