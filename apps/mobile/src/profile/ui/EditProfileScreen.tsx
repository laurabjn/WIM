import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
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
import { ProfileStackParamList } from 'src/navigation/type/profileStack';
import { getSession } from 'src/auth/infrastructure/authStorage';
import { updateMyProfile } from '../infrastructure/profile.api';
import { ENVIRONMENTS } from '@wim/shared/src/utils/travelOption';
import { LANGUAGES_OPTIONS } from '../../../../../packages/shared/src/utils/languagesOptions';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<ProfileStackParamList, 'EditProfile'>;

export function EditProfileScreen({ route, navigation }: Props) {
  const { t } = useTranslation(['profile', 'common']);
  const { profile } = route.params;

  const initialPreferredEnvironments =
    profile.travelPreferences?.preferredEnvironments ?? [];

  const initialLanguages = Array.isArray(profile.languages)
    ? profile.languages
    : [];

  const [fullName, setFullName] = useState(
    `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim(),
  );
  const [bio, setBio] = useState(profile.bio ?? '');
  const [ageInput, setAgeInput] = useState(
    profile.age ? String(profile.age) : '',
  );
  const [languageSearch, setLanguageSearch] = useState('');
  const [selectedLanguages, setSelectedLanguages] =
    useState<string[]>(initialLanguages);
  const [preferredEnvironments, setPreferredEnvironments] = useState<string[]>(
    initialPreferredEnvironments,
  );
  const [isSaving, setIsSaving] = useState(false);

  const filteredLanguages = useMemo(() => {
    if (!languageSearch.trim()) return LANGUAGES_OPTIONS;

    return LANGUAGES_OPTIONS.filter((language) =>
      language.toLowerCase().includes(languageSearch.toLowerCase()),
    );
  }, [languageSearch]);

  function toggleEnvironment(environment: string) {
    setPreferredEnvironments((prev) =>
      prev.includes(environment)
        ? prev.filter((item) => item !== environment)
        : [...prev, environment],
    );
  }

  function toggleLanguage(language: string) {
    setSelectedLanguages((prev) =>
      prev.includes(language)
        ? prev.filter((item) => item !== language)
        : [...prev, language],
    );
  }

  async function handleSave() {
    try {
      setIsSaving(true);

      const session = await getSession();

      if (!session?.accessToken) {
        throw new Error(t('common:genericError'));
      }

      const [firstName = '', ...rest] = fullName.trim().split(' ');
      const lastName = rest.join(' ');

      const updatedProfile = await updateMyProfile(session.accessToken, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        bio: bio.trim() || null,
        languages: selectedLanguages,
        travelPreferences: {
          ...profile.travelPreferences,
          preferredCountries:
            profile.travelPreferences?.preferredCountries ?? [],
          preferredHomeTypes:
            profile.travelPreferences?.preferredHomeTypes ?? [],
          minCapacity: profile.travelPreferences?.minCapacity ?? null,
          maxCapacity: profile.travelPreferences?.maxCapacity ?? null,
          carExchangeAccepted:
            profile.travelPreferences?.carExchangeAccepted ?? null,
          flexibleDates: profile.travelPreferences?.flexibleDates ?? null,
          preferredEnvironments,
        },
      });

      Alert.alert(
        t('profile:editProfile.savedTitle'),
        t('profile:editProfile.savedMessage'),
      );

      navigation.navigate({
        name: 'ProfileMain',
        params: { updatedProfile },
        merge: true,
      });
    } catch (error) {
      console.log('Edit profile save error:', error);

      Alert.alert(
        t('profile:editProfile.errorTitle'),
        t('profile:editProfile.errorMessage')
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.headerIcon}>←</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={handleSave} disabled={isSaving}>
            <Text style={styles.headerSaveText}>
              {t('common:save')}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            <Image
              source={{
                uri:
                  profile.avatarUrl ??
                  'https://via.placeholder.com/120x120.png?text=User',
              }}
              style={styles.avatar}
            />

            <TouchableOpacity
              style={styles.avatarEditBadge}
              onPress={() => console.log('Changer avatar')}
            >
              <Text style={styles.avatarEditIcon}>✎</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => console.log('Changer avatar')}>
            <Text style={styles.changePhotoText}>
              {t('profile:editProfile.changePhoto')}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>
          {t('profile:editProfile.favoriteEnvironment')}
        </Text>

        <View style={styles.environmentGrid}>
          {ENVIRONMENTS.map((environment) => {
            const selected = preferredEnvironments.includes(environment);

            return (
              <TouchableOpacity
                key={environment}
                style={[
                  styles.environmentChip,
                  selected && styles.environmentChipSelected,
                ]}
                onPress={() => toggleEnvironment(environment)}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.environmentChipText,
                    selected && styles.environmentChipTextSelected,
                  ]}
                >
                  {t(`profile:environments.${environment}`)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>
          {t('profile:editProfile.presentation')}
        </Text>

        <View style={styles.formSection}>
          <TextInput
            value={fullName}
            onChangeText={setFullName}
            style={styles.input}
            placeholder={t('profile:editProfile.namePlaceholder')}
            placeholderTextColor="#B8B8B8"
          />

          <TextInput
            value={ageInput}
            onChangeText={setAgeInput}
            style={styles.input}
            placeholder={t('profile:editProfile.agePlaceholder')}
            placeholderTextColor="#B8B8B8"
            keyboardType="numeric"
          />

          <TextInput
            value={bio}
            onChangeText={setBio}
            style={[styles.input, styles.bioInput]}
            placeholder={t('profile:editProfile.bioPlaceholder')}
            placeholderTextColor="#B8B8B8"
            multiline
            textAlignVertical="top"
          />
        </View>

        <Text style={styles.sectionTitle}>
          {t('profile:editProfile.languages')}
        </Text>

        <View style={styles.searchBox}>
          <TextInput
            value={languageSearch}
            onChangeText={setLanguageSearch}
            style={styles.searchInput}
            placeholder={t('profile:editProfile.searchLanguagePlaceholder')}
            placeholderTextColor="#8D8D8D"
          />
        </View>

        <View style={styles.languagesList}>
          {filteredLanguages.map((language) => {
            const selected = selectedLanguages.includes(language);

            return (
              <TouchableOpacity
                key={language}
                style={[
                  styles.languageChip,
                  selected && styles.languageChipSelected,
                ]}
                onPress={() => toggleLanguage(language)}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.languageChipText,
                    selected && styles.languageChipTextSelected,
                  ]}
                >
                  {t(`profile:language.${language}`)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>


      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F3F4',
  },
  screen: {
    flex: 1,
    backgroundColor: '#F3F3F4',
  },
  container: {
    padding: 16,
    paddingBottom: 110,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  headerIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    fontSize: 16,
    color: '#111111',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111111',
  },
  headerSaveText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2DA7F3',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 22,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#DDD',
  },
  avatarEditBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#52D1A6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarEditIcon: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  changePhotoText: {
    marginTop: 8,
    fontSize: 12,
    color: '#7A7A7A',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F1F1F',
    marginBottom: 10,
    marginTop: 10,
  },
  environmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 18,
  },
  environmentChip: {
    minWidth: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#DCDCDC',
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  environmentChipSelected: {
    backgroundColor: '#2C9B74',
    borderColor: '#2C9B74',
  },
  environmentChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F1F1F',
  },
  environmentChipTextSelected: {
    color: '#FFFFFF',
  },
  formSection: {
    marginBottom: 18,
  },
  input: {
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E7E7E7',
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 14,
    color: '#111111',
    marginBottom: 10,
  },
  bioInput: {
    minHeight: 120,
  },
  searchBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 14,
  },
  searchInput: {
    height: 46,
    fontSize: 14,
    color: '#1F1F1F',
  },
  languagesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 22,
  },
  languageChip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#DCDCDC',
  },
  languageChipSelected: {
    backgroundColor: '#52D1A6',
    borderColor: '#52D1A6',
  },
  languageChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F1F1F',
  },
  languageChipTextSelected: {
    color: '#FFFFFF',
  },
  saveButtonWrapper: {
    marginTop: 4,
  },
  saveButton: {
    width: '100%',
    minHeight: 54,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});