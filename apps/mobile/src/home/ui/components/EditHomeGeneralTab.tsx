import React from 'react';
import { Image, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

type Props = {
  title: string;
  description: string;
  photos: string[];
  onChangeTitle: (value: string) => void;
  onChangeDescription: (value: string) => void;
};

export function EditHomeGeneralTab({
  title,
  description,
  photos,
  onChangeTitle,
  onChangeDescription,
}: Props) {
  const { t } = useTranslation('home');

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

const styles = StyleSheet.create({
  form: {
    paddingHorizontal: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    paddingHorizontal: 14,
    fontSize: 13,
    color: '#111111',
    marginBottom: 18,
  },
  textarea: {
    minHeight: 145,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 13,
    color: '#111111',
    marginBottom: 18,
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
    backgroundColor: '#F3F4F6',
  },
  smallPhotosColumn: {
    width: 118,
    gap: 8,
  },
  smallPhoto: {
    width: '100%',
    height: 88.5,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  fullPhoto: {
    width: '100%',
    height: 245,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  emptyPhotos: {
    height: 180,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyPhotosText: {
    color: '#6B7280',
    fontSize: 13,
  },
});