import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../../navigation/authStack';
import { useTranslation } from 'react-i18next';
import { registerUserApi } from '../../infrastructure/api';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { uploadProfileImage } from '../../infrastructure/upload/uploadProfileImage';
import { Stepper } from '../components/Stepper';
import { clearSession, saveSession } from 'src/auth/infrastructure/authStorage';
import { BackButton } from 'src/shared/ui/BackButton';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';

type Props = NativeStackScreenProps<AuthStackParamList, 'RegisterStep5'>;

const BIO_MAX_LENGTH = 200;

export const RegisterStep5Screen: React.FC<Props> = ({ route, navigation }) => {
  const { t } = useTranslation(['auth', 'common']);
  const themeColors = useThemeColors();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);
  const {
    firstName,
    lastName,
    birthDate,
    nationality,
    country,
    email,
    phone,
    password,
  } = route.params;

  const [bio, setBio] = useState('');
  const [profilePhotoUri, setProfilePhotoUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFormValid = useMemo(() => {
    return (
      bio.trim() !== '' &&
      bio.length <= BIO_MAX_LENGTH &&
      profilePhotoUri !== null
    );
  }, [bio, profilePhotoUri]);

  async function pickProfilePhoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        t('auth:register.permission'),
        t('auth:register.permissionDescription'),
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled) {
      setProfilePhotoUri(result.assets[0]?.uri ?? null);
    }
  }

  async function handleContinue() {
    setError(null);

    if (!isFormValid) {
      setError(t('auth:requiredFields'));
      return;
    }

    setIsSubmitting(true);

    try {
      const avatarUrl = profilePhotoUri
        ? await uploadProfileImage(profilePhotoUri)
        : undefined;

      const session = await registerUserApi({
        firstName,
        lastName,
        birthDate,
        nationality,
        country,
        email,
        phone,
        password,
        bio,
        avatarUrl,
      });

      await clearSession();
      await saveSession({
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
          user: {
            ...session.user,
            isAdmin: session.user.isAdmin ?? false,
          },
      });

      navigation.navigate('RegisterIdentity', {
        identityRedirectUrl: session.identityRedirectUrl,
      });
    } catch (err: any) {
      setError(err?.message ?? t('auth:genericError'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.container}>
            <View style={styles.card}>
              <View style={styles.header}>
                <BackButton onPress={() => navigation.goBack()} style={styles.backButton} />

                <Text style={styles.headerTitle}>{t('auth:register.title')}</Text>
              </View>

              <View style={styles.content}>
                <Stepper current={5} total={5} />
                
                <Text style={styles.sectionTitle}>
                {t('auth:register.personalizedProfile')}
                </Text>
                              
                <TouchableOpacity
                  style={styles.uploadField}
                  onPress={pickProfilePhoto}
                  activeOpacity={0.8}
                >
                  <View style={styles.uploadLeft}>
                    <Text style={styles.uploadIcon}>⇪</Text>
                    <Text style={styles.uploadText}>
                      {t('auth:register.picture')}
                    </Text>
                  </View>
                </TouchableOpacity>

                {profilePhotoUri && (
                  <View style={styles.previewContainer}>
                    <Image
                      source={{ uri: profilePhotoUri }}
                      style={styles.previewImage}
                    />
                    <TouchableOpacity onPress={() => setProfilePhotoUri(null)}>
                      <Text style={styles.removePhotoText}>
                        {t('common:delete')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                <TextInput
                  style={styles.bioInput}
                  placeholder={t('auth:register.biography')}
                  placeholderTextColor="#C0C0C0"
                  value={bio}
                  onChangeText={(text) => {
                    if (text.length <= BIO_MAX_LENGTH) {
                      setBio(text);
                    }
                  }}
                  multiline
                  textAlignVertical="top"
                  maxLength={BIO_MAX_LENGTH}
                />

                <Text style={styles.charCount}>
                  {bio.length} / {BIO_MAX_LENGTH}
                </Text>

                {error && <Text style={styles.errorText}>{error}</Text>}
              </View>

              <View style={styles.footer}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  style={styles.buttonWrapper}
                  onPress={handleContinue}
                  disabled={isSubmitting}
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
                      {isSubmitting
                        ? t('auth:register.creatingAccount')
                        : t('common:continue')}
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

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: c.surfaceAlt,
  },

  keyboardContainer: {
    flex: 1,
    backgroundColor: c.surfaceAlt,
  },

  scrollContent: {
    flexGrow: 1,
  },

  container: {
    flex: 1,
    backgroundColor: c.surfaceAlt,
  },

  card: {
    flex: 1,
    backgroundColor: c.surface,
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
    borderColor: c.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  backButtonText: {
    fontSize: 16,
    color: c.text,
  },

  headerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: c.text,
  },

  content: {
    flex: 1,
    justifyContent: 'center',
  },
    
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: c.text,
    textAlign: 'center',
    marginBottom: 18,
   },

  uploadField: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: c.border,
    paddingHorizontal: 14,
    justifyContent: 'center',
    marginBottom: 12,
    backgroundColor: c.surface,
  },

  uploadLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  uploadIcon: {
    fontSize: 14,
    marginRight: 10,
    color: c.text,
  },

  uploadText: {
    fontSize: 13,
    color: c.text,
    fontWeight: '500',
  },

  previewContainer: {
    marginBottom: 12,
    alignItems: 'flex-start',
  },

  previewImage: {
    width: 90,
    height: 90,
    borderRadius: 14,
    marginBottom: 6,
  },

  removePhotoText: {
    fontSize: 12,
    color: c.danger,
    fontWeight: '500',
  },

  bioInput: {
    minHeight: 48,
    maxHeight: 100,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: c.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 13,
    color: c.text,
    backgroundColor: c.surface,
  },

  charCount: {
    fontSize: 11,
    color: '#7C7C7C',
    textAlign: 'right',
    marginTop: 4,
    marginBottom: 8,
  },

  errorText: {
    marginTop: 4,
    fontSize: 12,
    color: c.danger,
    textAlign: 'center',
  },

  footer: {
    width: '100%',
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
    color: c.onContrast,
    fontWeight: '700',
    fontSize: 16,
  },
});