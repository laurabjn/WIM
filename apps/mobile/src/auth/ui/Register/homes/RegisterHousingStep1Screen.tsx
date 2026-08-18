import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  StyleSheet,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../../../navigation/authStack';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Stepper } from '../../components/Stepper';
import { PickedPhoto } from '@wim/shared/home/home.type';
import { BackButton } from 'src/shared/ui/BackButton';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';

type Props = NativeStackScreenProps<AuthStackParamList, 'RegisterHousingStep1'>;

export const RegisterHousingStep1Screen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation(['auth', 'common', 'home']);
  const themeColors = useThemeColors();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);

  const [photos, setPhotos] = useState<PickedPhoto[]>([]);
  const [error, setError] = useState<string | null>(null);

  const isFormValid = useMemo(() => {
    return photos.length > 0;
  }, [photos]);

  async function pickHousingPhoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        t('auth:register.permission'),
        t('auth:register.permissionDescription'),
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      mediaTypes: ['images'],
      quality: 0.8,
      selectionLimit: 10,
    });

  if (result.canceled) return;

    const selectedPhotos = result.assets.map((asset, index) => ({
      uri: asset.uri,
      name: asset.fileName ?? `home-photo-${Date.now()}-${index}.jpg`,
      type: asset.mimeType ?? 'image/jpeg',
    }));

    setPhotos((prev) => [...prev, ...selectedPhotos].slice(0, 10));
  }

  function removePhoto(uri: string) {
    setPhotos((prev) => prev.filter((photo) => photo.uri !== uri));
  }

  async function handleContinue() {
    setError(null);
    
    if (!isFormValid) {
      setError(t('auth:requiredFields'));
      return;
    }

    if (photos.length > 0) {
      navigation.navigate('RegisterHousingStep2', { photos });
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <View style={styles.card}>
            <View style={styles.header}>
              <BackButton
                onPress={() => navigation.goBack()}
                style={styles.backButton}
              />
              <Text style={styles.headerTitle}>{t('auth:register.title')}</Text>
            </View>

            <View style={styles.content}>
              <Stepper current={1} total={4} />
              <Text style={styles.sectionTitle}>
              {t('home:homeDescription')}
              </Text>
              
              <TouchableOpacity style={styles.uploadField} onPress={pickHousingPhoto}>
                <View style={styles.uploadLeft}>
                  <Text style={styles.uploadIcon}>⇪</Text>
                  <Text style={styles.uploadText}>{t('home:homePhoto')}</Text>
                </View>
              </TouchableOpacity>

              {photos.length > 0 && (
                <View style={styles.previewGrid}>
                  {photos.map((photo) => (
                    <View key={photo.uri} style={styles.previewItem}>
                      <Image source={{ uri: photo.uri }} style={styles.previewImage} />

                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => removePhoto(photo.uri)}
                      >
                        <Text style={styles.removeButtonText}>×</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

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
                    {t('common:continue')}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
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

  previewItem: {
    position: 'relative',
  },

  previewImage: {
    width: 90,
    height: 90,
    borderRadius: 14,
  },

  removeButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: c.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },

  removeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 18,
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

  previewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
    marginBottom: 12,
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
    color: c.textMuted,
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
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});