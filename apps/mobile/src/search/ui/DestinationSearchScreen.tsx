import React, { useEffect, useState, useMemo } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Clock3,
  MapPin,
  Search,
  Trash2,
} from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { SearchStackParamList } from 'src/navigation/type/searchTabs';
import {
  DestinationSuggestion,
  searchDestinationsApi,
} from '../infrastructure/mapboxSearch.api';
import {
  clearRecentDestinations,
  getRecentDestinations,
  saveRecentDestination,
} from '../infrastructure/recentDestination.storage';
import { useTranslation } from 'react-i18next';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';

type Props = NativeStackScreenProps<
  SearchStackParamList,
  'DestinationSearch'
>;

export const DestinationSearchScreen: React.FC<Props> = ({
  navigation,
  route,
}) => {
  const themeColors = useThemeColors();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);
  const { t } = useTranslation("search")
  const [query, setQuery] = useState(
    route.params?.currentDestination ?? '',
  );

  const [suggestions, setSuggestions] = useState<
    DestinationSuggestion[]
  >([]);

  const [recentDestinations, setRecentDestinations] =
    useState<DestinationSuggestion[]>([]);

  const [loading, setLoading] = useState(false);
  const [recentLoading, setRecentLoading] =
    useState(true);
  const [error, setError] = useState<string | null>(
    null,
  );

  const normalizedQuery = query.trim();
  const isSearching = normalizedQuery.length >= 2;

  useEffect(() => {
    async function loadRecentDestinations() {
      try {
        setRecentLoading(true);

        const recentItems =
          await getRecentDestinations();

        setRecentDestinations(recentItems);
      } finally {
        setRecentLoading(false);
      }
    }

    loadRecentDestinations();
  }, []);

  useEffect(() => {
    if (!isSearching) {
      setSuggestions([]);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;

    const timeout = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);

        const results =
          await searchDestinationsApi(
            normalizedQuery,
          );

        if (!cancelled) {
          setSuggestions(results);
        }
      } catch (currentError) {
        console.log(
          'Destination search error:',
          currentError,
        );

        if (!cancelled) {
          setSuggestions([]);
          setError(
            'Impossible de charger les destinations.',
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [isSearching, normalizedQuery]);

  async function selectDestination(
    destination: DestinationSuggestion,
  ) {
    const updatedRecentDestinations =
      await saveRecentDestination(destination);

    setRecentDestinations(
      updatedRecentDestinations,
    );

    route.params?.onSelectDestination?.(
      destination.fullName,
    );

    navigation.goBack();
  }

  const displayedDestinations = isSearching
    ? suggestions
    : recentDestinations;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.content}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
        <View style={styles.searchBox}>
          <Search size={18} color={themeColors.text} />

          <TextInput
            value={query}
            onChangeText={setQuery}
            autoFocus
            autoCorrect={false}
            placeholder="Destination"
            placeholderTextColor="#999"
            style={styles.input}
          />

          {loading && (
            <ActivityIndicator size="small" />
          )}
        </View>

        <ScrollView
          style={styles.list}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {error && (
            <Text style={styles.errorText}>
              {error}
            </Text>
          )}

          {!isSearching &&
            recentLoading && (
              <ActivityIndicator
                style={styles.recentLoader}
              />
            )}

          {isSearching &&
            !loading &&
            !error &&
            suggestions.length === 0 && (
              <Text style={styles.emptyText}>
                {t('noDestination')}
              </Text>
            )}

          {!isSearching &&
            !recentLoading &&
            recentDestinations.length ===
              0 && (
              <Text style={styles.emptyText}>
                {t('noRecentDestination')}
              </Text>
            )}

          {displayedDestinations.map(
            (suggestion) => (
              <TouchableOpacity
                key={suggestion.id}
                style={styles.item}
                onPress={() =>
                  selectDestination(suggestion)
                }
              >
                <View style={styles.iconContainer}>
                  {isSearching ? (
                    <MapPin
                      size={16}
                      color={themeColors.text}
                    />
                  ) : (
                    <Clock3
                      size={16}
                      color={themeColors.text}
                    />
                  )}
                </View>

                <View style={styles.itemContent}>
                  <Text style={styles.itemTitle}>
                    {suggestion.name ||
                      suggestion.city}
                  </Text>

                  <Text
                    style={styles.itemSubtitle}
                    numberOfLines={1}
                  >
                    {suggestion.fullName ||
                      [
                        suggestion.city,
                        suggestion.country,
                      ]
                        .filter(Boolean)
                        .join(', ')}
                  </Text>
                </View>
              </TouchableOpacity>
            ),
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.surface,
  },
  content: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 20,
  },
  searchBox: {
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: c.text,
  },
  sectionHeader: {
    marginTop: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: c.text,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
  },
  clearText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#777',
  },
  list: {
    flex: 1,
    marginTop: 12,
  },
  item: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: c.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemContent: {
    flex: 1,
    marginLeft: 12,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: c.text,
  },
  itemSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: '#666',
  },
  recentLoader: {
    marginTop: 20,
  },
  errorText: {
    marginTop: 10,
    fontSize: 13,
    color: '#D64545',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 13,
    color: '#777',
  },
});