import React, { useState, useMemo } from 'react';
import {
    ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, SlidersHorizontal } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SearchStackParamList } from 'src/navigation/type/searchTabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BackButton } from 'src/shared/ui/BackButton';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';

type Props = NativeStackScreenProps<SearchStackParamList, 'Search'>;

export const SearchScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation("search");
  const themeColors = useThemeColors();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [travelers, setTravelers] = useState('');
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [isDestinationFocused, setIsDestinationFocused] = useState(false);

  const destinationSuggestions = [
    'San Francisco, USA',
    'San Diego, USA',
    'San Sebastian, Espagne',
    'Sanita',
  ];

  function toLocalApiDate(date: Date | null): string | undefined {
    if (!date) return undefined;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  function handleSearch() {
    navigation.navigate('SearchResults', {
      city: destination,
      startDate: toLocalApiDate(startDate),
      endDate: toLocalApiDate(endDate),
      capacity: travelers ? Number(travelers) : undefined,
    });
  }

  function formatDate(date: Date | null) {
    if (!date) return '';

    return date.toLocaleDateString('fr-FR');
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <BackButton
                  onPress={() => navigation.goBack()}
                  style={styles.iconButton}
                />

                <Text style={styles.title}>{t("search")}</Text>

                <TouchableOpacity style={styles.iconButton}>
                <SlidersHorizontal size={18} color={themeColors.text} />
                </TouchableOpacity>
            </View>

            <View style={styles.form}>
              <TouchableOpacity
                style={styles.input}
                onPress={() =>
                  navigation.navigate('DestinationSearch', {
                    currentDestination: destination,
                    onSelectDestination: setDestination,
                  })
                }
              >
                <Text style={destination ? styles.inputText : styles.placeholderText}>
                  {destination || t('destination')}
                </Text>
              </TouchableOpacity>

                <View style={styles.row}>
                  <TouchableOpacity
                    style={styles.dateInput}
                    onPress={() => setShowStartPicker(true)}
                  >
                    <Text
                      style={[
                        styles.dateText,
                        !startDate && styles.placeholderText,
                      ]}
                    >
                      {startDate
                        ? formatDate(startDate)
                        : t('startDate')}
                    </Text>

                    <Calendar size={16} color="#D0D0D0" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.dateInput}
                    onPress={() => setShowEndPicker(true)}
                  >
                    <Text
                      style={[
                        styles.dateText,
                        !endDate && styles.placeholderText,
                      ]}
                    >
                      {endDate
                        ? formatDate(endDate)
                        : t('endDate')}
                    </Text>

                    <Calendar size={16} color="#D0D0D0" />
                  </TouchableOpacity>
                  
                  {showStartPicker && (
                    <DateTimePicker
                      value={startDate ?? new Date()}
                      mode="date"
                      display="default"
                      minimumDate={new Date()}
                      onChange={(_, selectedDate) => {
                        setShowStartPicker(false);

                        if (selectedDate) {
                          setStartDate(selectedDate);
                        }
                      }}
                    />
                  )}

                  {showEndPicker && (
                    <DateTimePicker
                      value={endDate ?? startDate ?? new Date()}
                      mode="date"
                      display="default"
                      minimumDate={startDate ?? new Date()}
                      onChange={(_, selectedDate) => {
                        setShowEndPicker(false);

                        if (selectedDate) {
                          setEndDate(selectedDate);
                        }
                      }}
                    />
                  )}
                </View>

                <TextInput
                  value={travelers}
                  onChangeText={setTravelers}
                  placeholder={t("travelers")}
                  placeholderTextColor="#D0D0D0"
                  keyboardType="numeric"
                  style={styles.input}
                />
            </View>

            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                <Text style={styles.searchButtonText}>{t("toSearch")}</Text>
            </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.surface,
    paddingHorizontal: 8,
  },
  content: {
    paddingTop: 8,
    paddingHorizontal: 18,
    paddingBottom: 90,
  },
  inputText: {
    fontSize: 13,
    color: c.text,
  },
  dateText: {
    flex: 1,
    fontSize: 12,
    color: c.text,
  },
  placeholderText: {
    color: '#D0D0D0',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: c.surface,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
  },
  form: {
    marginTop: 250,
    gap: 10,
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    paddingHorizontal: 16,
    fontSize: 13,
    color: c.text,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  dateInput: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateTextInput: {
    flex: 1,
    fontSize: 12,
    color: c.text,
  },
  searchButton: {
    position: 'absolute',
    bottom: 5,
    left: 8,
    right: 8,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#25AEEB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonText: {
    color: c.onContrast,
    fontSize: 13,
    fontWeight: '800',
  },
});