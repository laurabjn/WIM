import React, { useMemo } from 'react';
import { Image, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';

type Props = {
  title: string;
  description: string;
  address: string;
  city: string;
  country: string;
  photos: string[];
  onChangeTitle: (value: string) => void;
  onChangeDescription: (value: string) => void;
  onChangeAddress: (value: string) => void;
  onChangeCity: (value: string) => void;
  onChangeCountry: (value: string) => void;
};

export function EditHomeGeneralTab({
  title,
  description,
  address,
  city,
  country,
  photos,
  onChangeTitle,
  onChangeDescription,
  onChangeAddress,
  onChangeCity,
  onChangeCountry,
}: Props) {
  const { t } = useTranslation('home');
  const themeColors = useThemeColors();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);

  return (
    <View style={styles.form}>
      <Text style={styles.label}>{t('title')}</Text>

      <TextInput
        value={title}
        onChangeText={onChangeTitle}
        placeholder={t('title')}
        style={styles.input}
      />

      <Text style={styles.label}>{t('description')}</Text>

      <TextInput
        value={description}
        onChangeText={onChangeDescription}
        placeholder={t('descriptionPlaceholder')}
        placeholderTextColor="#C9C9C9"
        multiline
        textAlignVertical="top"
        style={styles.textarea}
      />

      <Text style={styles.label}>{t('address')}</Text>

      <TextInput
        value={address}
        onChangeText={onChangeAddress}
        placeholder={t('address')}
        placeholderTextColor="#C9C9C9"
        style={styles.input}
      />

      <View style={styles.row}>
        <View style={styles.rowItem}>
          <Text style={styles.label}>{t('city')}</Text>

          <TextInput
            value={city}
            onChangeText={onChangeCity}
            placeholder={t('city')}
            placeholderTextColor="#C9C9C9"
            style={styles.input}
          />
        </View>

        <View style={styles.rowItem}>
          <Text style={styles.label}>{t('country')}</Text>

          <TextInput
            value={country}
            onChangeText={onChangeCountry}
            placeholder={t('country')}
            placeholderTextColor="#C9C9C9"
            style={styles.input}
          />
        </View>
      </View>

      <Text style={styles.label}>{t('homePhoto')}</Text>

      {photos.length > 0 ? (
        <>
          <View style={styles.photosGrid}>
            {photos[0] ? (
              <Image source={{ uri: photos[0] }} style={styles.largePhoto} />
            ) : null}

            <View style={styles.smallPhotosColumn}>
              {photos[1] ? (
                <Image source={{ uri: photos[1] }} style={styles.smallPhoto} />
              ) : null}

              {photos[2] ? (
                <Image source={{ uri: photos[2] }} style={styles.smallPhoto} />
              ) : null}
            </View>
          </View>

          {photos[3] ? (
            <Image source={{ uri: photos[3] }} style={styles.fullPhoto} />
          ) : null}
        </>
      ) : (
        <View style={styles.emptyPhotos}>
          <Text style={styles.emptyPhotosText}>
            {t('noPhoto', 'Aucune photo')}
          </Text>
        </View>
      )}
    </View>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
  form: {
    paddingHorizontal: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: c.text,
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: c.border,
    paddingHorizontal: 14,
    fontSize: 13,
    color: c.text,
    marginBottom: 18,
  },
  textarea: {
    minHeight: 145,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: c.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 13,
    color: c.text,
    marginBottom: 18,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  rowItem: {
    flex: 1,
  },
  photosGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  largePhoto: {
    flex: 1,
    height: 185,
    borderRadius: 12,
    backgroundColor: c.surfaceAlt,
  },
  smallPhotosColumn: {
    width: 118,
    gap: 8,
  },
  smallPhoto: {
    width: '100%',
    height: 88.5,
    borderRadius: 12,
    backgroundColor: c.surfaceAlt,
  },
  fullPhoto: {
    width: '100%',
    height: 245,
    borderRadius: 12,
    backgroundColor: c.surfaceAlt,
  },
  emptyPhotos: {
    height: 180,
    borderRadius: 12,
    backgroundColor: c.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyPhotosText: {
    color: c.textMuted,
    fontSize: 13,
  },
});