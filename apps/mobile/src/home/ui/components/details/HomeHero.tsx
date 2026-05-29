import { Home } from '@wim/shared/home/home.type';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { resolveImageUrl } from 'src/home/infrastructure/home.api';
import { Share } from 'react-native';

type Props = {
  home: Home;
  onBack: () => void;
  isFavorite: boolean;
  onToggleFavorite: (homeId: string) => void;
  onShare?: () => void;
};

export function HomeHero({ home, onBack, isFavorite, onToggleFavorite, onShare }: Props) {
  const { t } = useTranslation('home');
  const coverUrl = resolveImageUrl(home.photos?.[0]?.url);

  return (
    <View style={styles.hero}>
      {coverUrl ? (
        <Image source={{ uri: coverUrl }} style={styles.heroImage} />
      ) : (
        <View style={styles.emptyHero}>
          <Text style={styles.emptyHeroText}>{t('noPhotos')}</Text>
        </View>
      )}

      <TouchableOpacity style={[styles.circleButton, styles.backButton]} onPress={onBack}>
        <Text style={styles.icon}>‹</Text>
      </TouchableOpacity>

      <View style={styles.topActions}>
        <TouchableOpacity style={styles.circleButton} onPress={onShare}>
          <Text style={styles.icon}>↗</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.circleButton} onPress={() => onToggleFavorite(home.id)}>
          <Text style={[styles.icon, isFavorite && styles.favoriteIcon]}>
            {isFavorite ? '★' : '☆'}
          </Text>
        </TouchableOpacity>
      </View>

      {home.photos?.length > 0 ? (
        <Text style={styles.imageCounter}>1/{home.photos.length}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    height: 300,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  emptyHero: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyHeroText: {
    color: '#6B7280',
    fontWeight: '600',
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
  },
  topActions: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    gap: 10,
  },
  icon: {
    fontSize: 20,
    color: '#111111',
  },
  favoriteIcon: {
    color: '#F59E0B',
  },
  imageCounter: {
    position: 'absolute',
    right: 14,
    bottom: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});