import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

type Review = {
  id: string;
  score: number;
  comment: string;
  createdAt: string;
  author: {
    firstName?: string | null;
    avatarUrl?: string | null;
    createdAt?: string | null;
  };
};

type Props = {
  averageScore?: number | null;
  reviewsCount?: number;
  reviews?: Review[];
};

export function HomeReviews({
  averageScore = 4.2,
  reviewsCount = 23,
  reviews = [],
}: Props) {
  const { t } = useTranslation('home');

  const firstReview =
    reviews[0] ??
    {
      id: 'mock-review',
      score: 4,
      comment:
        'Mon partenaire et moi avons séjourné dans cet appartement et il était tout simplement parfait pour nos 3 jours à San Francisco. C’était propre et il y avait de belles vues. Nous reviendrons volontiers séjourner ici.',
      createdAt: new Date().toISOString(),
      author: {
        firstName: 'Terry',
        avatarUrl:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
        createdAt: new Date().toISOString(),
      },
    };

  return (
    <View style={styles.section}>
      <Text style={styles.title}>
        ★ {averageScore?.toFixed(1)} ·{' '}
        {t('reviewsCount', { count: reviewsCount })}
      </Text>

      <View style={styles.card}>
        <View style={styles.reviewHeader}>
          <Text style={styles.stars}>{renderStars(firstReview.score)}</Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.date}>
            {t('reviewDateFallback', 'il y a 2 mois')}
          </Text>
        </View>

        <Text style={styles.comment} numberOfLines={5}>
          {firstReview.comment}
        </Text>

        <TouchableOpacity>
          <Text style={styles.readMore}>
            {t('showMore', 'Afficher plus')}
          </Text>
        </TouchableOpacity>

        <View style={styles.authorRow}>
          <Image
            source={{
              uri:
                firstReview.author.avatarUrl ??
                'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
            }}
            style={styles.avatar}
          />

          <View>
            <Text style={styles.authorName}>
              {firstReview.author.firstName ?? t('host', 'Hôte')}
            </Text>
            <Text style={styles.authorSince}>
              {t('hostSinceYears', { count: 8, defaultValue: 'Hôte depuis 8 ans' })}
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.outlineButton}>
        <Text style={styles.outlineText}>
          {t('showAllReviews', {
            count: reviewsCount,
            defaultValue: `Afficher les ${reviewsCount} commentaires`,
          })}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function renderStars(score: number) {
  const rounded = Math.round(score);
  return '★★★★★'
    .split('')
    .map((star, index) => (index < rounded ? '★' : '☆'))
    .join('');
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 18,
    paddingBottom: 28,
  },

  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 18,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  stars: {
    fontSize: 14,
    color: '#111111',
    fontWeight: '700',
  },

  dot: {
    marginHorizontal: 5,
    color: '#6B7280',
  },

  date: {
    fontSize: 12,
    color: '#6B7280',
  },

  comment: {
    fontSize: 13,
    lineHeight: 18,
    color: '#333333',
  },

  readMore: {
    marginTop: 2,
    fontSize: 13,
    color: '#111111',
    textDecorationLine: 'underline',
  },

  authorRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },

  authorName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111111',
  },

  authorSince: {
    marginTop: 2,
    fontSize: 11,
    color: '#6B7280',
  },

  outlineButton: {
    marginTop: 16,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D6D6D6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  outlineText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111111',
  },
});