import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../../navigation/authStack';
import { useTranslation } from 'react-i18next';
import { registerUserApi } from '../../infrastructure/api';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { uploadProfileImage } from '../../infrastructure/upload/uploadProfileImage';

type Props = NativeStackScreenProps<AuthStackParamList, 'RegisterStep2'>;

export const RegisterStep2Screen: React.FC<Props> = ({ route, navigation }) => {
  const { t } = useTranslation(['auth', 'common']);
  const { email, password, firstName, lastName, birthDate, nationality, country, phone } =
    route.params;

  const [bio, setBio] = useState('');
  const [profilePhotoUri, setProfilePhotoUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFormValid = useMemo(() => {
    return (
      bio.trim() !== ''
      && profilePhotoUri !== null
    );
  }, [bio, profilePhotoUri]);

  async function pickProfilePhoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        t('auth:register.permission'),
        t('auth:register.permissionDescription')
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

      const { identityRedirectUrl } = await registerUserApi({
        email,
        password,
        firstName,
        lastName,
        birthDate,
        nationality,
        country,
        phone,
        bio,
        avatarUrl,
        isAdmin: false,
      });

      navigation.navigate('RegisterIdentity', {
        identityRedirectUrl,
      });
    } catch (err: any) {
      setError(err.message ?? t('genericError'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text>←</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>{t('auth:register.title')}</Text>
        </View>

        <View style={styles.content}>
          <TouchableOpacity style={styles.uploadField} onPress={pickProfilePhoto}>
            <View style={styles.uploadLeft}>
              <Text style={styles.uploadIcon}>⇪</Text>
              <Text style={styles.uploadText}>{t('auth:register.picture')}</Text>
            </View>
          </TouchableOpacity>

          {profilePhotoUri && (
            <View style={styles.previewContainer}>
              <Image source={{ uri: profilePhotoUri }} style={styles.previewImage} />
              <TouchableOpacity onPress={() => setProfilePhotoUri(null)}>
                <Text style={styles.removePhotoText}>{t('common:delete')}</Text>
              </TouchableOpacity>
            </View>
          )}

          <TextInput
            style={styles.bioInput}
            placeholder={`${t('auth:register.biography')} *`}
            placeholderTextColor="#B0B0B0"
            value={bio}
            onChangeText={setBio}
            multiline
            textAlignVertical="top"
          />

          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.buttonWrapper}
            onPress={handleContinue}
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
                {isSubmitting && isFormValid ? t('auth:register.creatingAccount') : t('common:continue')}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  card: {
    width: '88%',
    minHeight: 620,
    backgroundColor: '#FFF',
    borderRadius: 32,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    elevation: 4,
    justifyContent: 'space-between',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
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
    fontSize: 16,
    fontWeight: '600',
    color: '#111111',
  },

  content: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 80,
  },

  uploadField: {
    height: 44,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    justifyContent: 'center',
    marginBottom: 14,
  },

  uploadLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  uploadIcon: {
    fontSize: 14,
    marginRight: 10,
    color: '#111111',
  },

  uploadText: {
    fontSize: 13,
    color: '#111111',
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
    color: '#DC2626',
    fontWeight: '500',
  },

  bioInput: {
    minHeight: 44,
    maxHeight: 100,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 13,
    color: '#111111',
    backgroundColor: '#FFFFFF',
  },

  errorText: {
    marginTop: 10,
    fontSize: 12,
    color: '#DC2626',
    textAlign: 'center',
  },

  footer: {
    marginTop: 20,
    width: '100%',
  },

  buttonWrapper: {
    width: '100%',
  },

  primaryButton: {
    width: '100%',
    height: 56,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
});