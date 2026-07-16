import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, Search, X } from 'lucide-react-native';

import { AuthStackParamList } from 'src/navigation/authStack';
import { Stepper } from '../../components/Stepper';
import { SelectedAddress, AddressSuggestion, suggestAddressesApi, retrieveAddressApi } from 'src/auth/infrastructure/mapboxAdress.api';

type Props = NativeStackScreenProps<
  AuthStackParamList,
  'RegisterHousingStep3'
>;

function createSessionToken(): string {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}-${Math.random().toString(36).slice(2)}`;
}

export const RegisterHousingStep3Screen: React.FC<Props> = ({
  navigation,
  route,
}) => {
  const { t } = useTranslation([
    'auth',
    'common',
    'home',
  ]);

  const { photos, description } = route.params;

  const [query, setQuery] = useState('');
  const [selectedAddress, setSelectedAddress] =
    useState<SelectedAddress | null>(null);

  const [suggestions, setSuggestions] = useState<
    AddressSuggestion[]
  >([]);

  const [isSearching, setIsSearching] =
    useState(false);

  const [isRetrieving, setIsRetrieving] =
    useState(false);

  const [error, setError] = useState<string | null>(
    null,
  );

  const sessionTokenRef = useRef(
    createSessionToken(),
  );

  const isFormValid = useMemo(
    () =>
      selectedAddress !== null &&
      Number.isFinite(selectedAddress.latitude) &&
      Number.isFinite(selectedAddress.longitude) &&
      selectedAddress.city.trim() !== '' &&
      selectedAddress.country.trim() !== '',
    [selectedAddress],
  );

  useEffect(() => {
    const normalizedQuery = query.trim();

    if (
      normalizedQuery.length < 3 ||
      selectedAddress?.fullAddress === query
    ) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    let cancelled = false;

    const timeout = setTimeout(async () => {
      try {
        setIsSearching(true);
        setError(null);

        const results = await suggestAddressesApi(
          normalizedQuery,
          sessionTokenRef.current,
        );

        if (!cancelled) {
          setSuggestions(results);
        }
      } catch (currentError) {
        console.log(
          'Mapbox address suggestions error:',
          currentError,
        );

        if (!cancelled) {
          setSuggestions([]);
          setError(
            t(
              'home:addressSearchError',
              'Impossible de rechercher cette adresse.',
            ),
          );
        }
      } finally {
        if (!cancelled) {
          setIsSearching(false);
        }
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [query, selectedAddress?.fullAddress, t]);

  function handleChangeAddress(value: string) {
    setQuery(value);
    setError(null);

    if (
      selectedAddress &&
      value !== selectedAddress.fullAddress
    ) {
      setSelectedAddress(null);
    }
  }

  async function handleSelectSuggestion(
    suggestion: AddressSuggestion,
  ) {
    try {
      setIsRetrieving(true);
      setError(null);

      const address = await retrieveAddressApi(
        suggestion.mapboxId,
        sessionTokenRef.current,
      );

      setSelectedAddress(address);
      setQuery(address.fullAddress);
      setSuggestions([]);
      
      sessionTokenRef.current = createSessionToken();
    } catch (currentError) {
      console.log(
        'Mapbox retrieve address error:',
        currentError,
      );

      setError(
        t(
          'home:addressRetrieveError',
          'Impossible de récupérer cette adresse.',
        ),
      );
    } finally {
      setIsRetrieving(false);
    }
  }

  function clearAddress() {
    setQuery('');
    setSelectedAddress(null);
    setSuggestions([]);
    setError(null);
    sessionTokenRef.current = createSessionToken();
  }

  function handleContinue() {
    setError(null);

    if (!selectedAddress || !isFormValid) {
      setError(
        t(
          'home:selectValidAddress',
          'Sélectionnez une adresse proposée dans la liste.',
        ),
      );
      return;
    }

    navigation.navigate('RegisterHousingStep4', {
      photos,
      description,
      location: {
        address: selectedAddress.address,
        city: selectedAddress.city,
        country: selectedAddress.country,
        latitude: selectedAddress.latitude,
        longitude: selectedAddress.longitude,
      },
    });
  }

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'bottom']}
    >
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={
          Platform.OS === 'ios' ? 'padding' : undefined
        }
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            <View style={styles.card}>
              <View>
                <View style={styles.header}>
                  <TouchableOpacity
                    style={styles.backButton}
                    onPress={() =>
                      navigation.goBack()
                    }
                  >
                    <Text
                      style={styles.backButtonText}
                    >
                      ←
                    </Text>
                  </TouchableOpacity>

                  <Text style={styles.headerTitle}>
                    {t('auth:register.title')}
                  </Text>
                </View>

                <View style={styles.content}>
                  <Stepper current={3} total={4} />

                  <Text style={styles.sectionTitle}>
                    {t('home:locationTitle')}
                  </Text>

                  <Text
                    style={styles.sectionDescription}
                  >
                    {t('home:locationDescription')}
                  </Text>

                  <View style={styles.inputsWrapper}>
                    <View style={styles.searchContainer}>
                      <Search
                        size={18}
                        color="#7C7C7C"
                      />

                      <TextInput
                        style={styles.addressInput}
                        placeholder={t('home:address')}
                        placeholderTextColor="#B4B4B4"
                        value={query}
                        onChangeText={
                          handleChangeAddress
                        }
                        autoCorrect={false}
                        autoCapitalize="words"
                        autoComplete="street-address"
                        textContentType="fullStreetAddress"
                        returnKeyType="search"
                      />

                      {isSearching ||
                      isRetrieving ? (
                        <ActivityIndicator
                          size="small"
                          color="#2DA7F3"
                        />
                      ) : query ? (
                        <TouchableOpacity
                          hitSlop={8}
                          onPress={clearAddress}
                        >
                          <X
                            size={18}
                            color="#777"
                          />
                        </TouchableOpacity>
                      ) : null}
                    </View>

                    {suggestions.length > 0 ? (
                      <View
                        style={styles.suggestionsBox}
                      >
                        {suggestions.map(
                          (suggestion) => (
                            <TouchableOpacity
                              key={
                                suggestion.mapboxId
                              }
                              style={
                                styles.suggestionItem
                              }
                              onPress={() =>
                                handleSelectSuggestion(
                                  suggestion,
                                )
                              }
                            >
                              <View
                                style={
                                  styles.pinContainer
                                }
                              >
                                <MapPin
                                  size={16}
                                  color="#111"
                                />
                              </View>

                              <View
                                style={
                                  styles.suggestionContent
                                }
                              >
                                <Text
                                  style={
                                    styles.suggestionName
                                  }
                                  numberOfLines={1}
                                >
                                  {suggestion.name}
                                </Text>

                                <Text
                                  style={
                                    styles.suggestionAddress
                                  }
                                  numberOfLines={2}
                                >
                                  {
                                    suggestion.fullAddress
                                  }
                                </Text>
                              </View>
                            </TouchableOpacity>
                          ),
                        )}
                      </View>
                    ) : null}

                    {selectedAddress ? (
                      <View
                        style={
                          styles.selectedAddressCard
                        }
                      >
                        <MapPin
                          size={18}
                          color="#31B985"
                        />

                        <View
                          style={
                            styles.selectedAddressContent
                          }
                        >
                          <Text
                            style={
                              styles.selectedAddressTitle
                            }
                          >
                            Adresse sélectionnée
                          </Text>

                          <Text
                            style={
                              styles.selectedAddressText
                            }
                          >
                            {
                              selectedAddress.fullAddress
                            }
                          </Text>

                          <Text
                            style={styles.coordinates}
                          >
                            {selectedAddress.latitude.toFixed(
                              5,
                            )}
                            {' · '}
                            {selectedAddress.longitude.toFixed(
                              5,
                            )}
                          </Text>
                        </View>
                      </View>
                    ) : null}

                    {error ? (
                      <Text style={styles.errorText}>
                        {error}
                      </Text>
                    ) : null}
                  </View>
                </View>
              </View>

              <View style={styles.footer}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  style={styles.buttonWrapper}
                  onPress={handleContinue}
                  disabled={
                    !isFormValid || isRetrieving
                  }
                >
                  <LinearGradient
                    colors={
                      isFormValid
                        ? ['#52D1A6', '#2DA7F3']
                        : ['#BFE8DC', '#B8D8EF']
                    }
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={styles.primaryButton}
                  >
                    <Text style={styles.primaryText}>
                      {t('common:continue')}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F4F5',
  },

  keyboardContainer: {
    flex: 1,
    backgroundColor: '#F4F4F5',
  },

  scrollContent: {
    flexGrow: 1,
  },

  container: {
    flex: 1,
    backgroundColor: '#F4F4F5',
  },

  card: {
    flex: 1,
    minHeight: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 28,
    justifyContent: 'space-between',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  backButtonText: {
    fontSize: 16,
    color: '#111111',
  },

  headerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111111',
  },

  content: {
    flex: 1,
    justifyContent: 'center',
  },

  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111111',
    textAlign: 'center',
    marginBottom: 18,
  },

  sectionDescription: {
    fontSize: 12,
    color: '#7C7C7C',
    textAlign: 'center',
    marginBottom: 18,
  },

  inputsWrapper: {
    gap: 12,
  },

  searchContainer: {
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  addressInput: {
    flex: 1,
    height: 50,
    fontSize: 14,
    color: '#111111',
  },

  suggestionsBox: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EBEBEB',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },

  suggestionItem: {
    minHeight: 62,
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EEEEEE',
  },

  pinContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F4F4F4',
    alignItems: 'center',
    justifyContent: 'center',
  },

  suggestionContent: {
    flex: 1,
    marginLeft: 11,
  },

  suggestionName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111111',
  },

  suggestionAddress: {
    marginTop: 3,
    fontSize: 11,
    lineHeight: 16,
    color: '#777777',
  },

  selectedAddressCard: {
    borderRadius: 14,
    backgroundColor: '#EDFBF6',
    borderWidth: 1,
    borderColor: '#B7EAD7',
    padding: 13,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },

  selectedAddressContent: {
    flex: 1,
  },

  selectedAddressTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#238B67',
  },

  selectedAddressText: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 17,
    color: '#333333',
  },

  coordinates: {
    marginTop: 4,
    fontSize: 10,
    color: '#6B7280',
  },

  errorText: {
    fontSize: 12,
    color: '#DC2626',
    textAlign: 'center',
  },

  footer: {
    width: '100%',
    marginTop: 24,
  },

  buttonWrapper: {
    width: '100%',
  },

  primaryButton: {
    height: 56,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});