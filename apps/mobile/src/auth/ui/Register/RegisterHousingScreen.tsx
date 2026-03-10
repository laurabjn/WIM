import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../../navigation/authStack';
import { useTranslation } from 'react-i18next';
import { signupStyles as s } from './signUpStyles';
import { LinearGradient } from 'expo-linear-gradient';

type Props = NativeStackScreenProps<AuthStackParamList, 'RegisterHousing'>;

export const RegisterHousingScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation(['auth', 'common']);
  
  const [title, setTitle] = useState('');
  const [type, setType] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFormValid = useMemo(() => {
    return (
      title.trim() !== '' &&
      type.trim() !== '' &&
      location.trim() !== '' &&
      capacity.trim() !== '' &&
      photoUri !== null
    );
  }, [title, type, location, capacity, photoUri]);

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
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0]?.uri ?? null);
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
      // TODO Sprint suivant :
      // 1) uploader la photo (photoUri) vers API /storage
      // 2) créer le logement via API /housing
      // 3) associer au user

      // Pour l’instant, on colle à la maquette: on passe à "Bienvenue"
      navigation.navigate('RegisterWelcome');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View style={s.container}>
      <View style={s.card}>
        <View style={s.header}>
          <TouchableOpacity style={s.backButton} onPress={() => navigation.goBack()}>
            <Text style={s.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>{t('auth:register.title')}</Text>
        </View>

        <View style={s.form}>
          <TextInput
            style={s.input}
            placeholder={`${t('auth:register.housingTitle')} *`}
            value={title}
            onChangeText={setTitle}
            placeholderTextColor="#9CA3AF"
          />
          <TextInput
            style={s.input}
            placeholder={`${t('auth:register.housingType')} *`}
            value={type}
            onChangeText={setType}
            placeholderTextColor="#9CA3AF"
          />
          <TextInput
            style={s.input}
            placeholder={`${t('auth:register.housingLocation')} *`}
            value={location}
            onChangeText={setLocation}
            placeholderTextColor="#9CA3AF"
          />
          <TextInput
            style={s.input}
            placeholder={`${t('auth:register.housingCapacity')} *`}
            value={capacity}
            onChangeText={setCapacity}
            placeholderTextColor="#9CA3AF"
            keyboardType="number-pad"
          />

          <TouchableOpacity style={s.uploadField} onPress={pickHousingPhoto}>
            <View style={s.uploadLeft}>
              <Text style={s.uploadIcon}>⇪</Text>
              <Text style={s.uploadText}>{t('auth:register.housingPhoto')}</Text>
            </View>
          </TouchableOpacity>

          {photoUri && (
            <View style={s.previewContainer}>
              <Image source={{ uri: photoUri }} style={s.previewImage} />
              <TouchableOpacity onPress={() => setPhotoUri(null)}>
                <Text style={s.removePhotoText}>{t('common:delete')}</Text>
              </TouchableOpacity>
            </View>
          )}

          {error && <Text style={s.errorText}>{error}</Text>}
        </View>

        <View style={s.footer}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={s.buttonWrapper}
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
              style={s.primaryButton}
            >
              <Text style={s.primaryText}>
                {isSubmitting ? t('auth:register.creatingAccount') : t('common:continue')}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};