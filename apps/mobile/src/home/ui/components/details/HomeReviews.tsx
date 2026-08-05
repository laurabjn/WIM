import React, { useMemo, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Review } from '@wim/shared';

// Nombre de lignes affichees tant que l'avis n'est pas deplie.
const COLLAPSED_LINES = 5;

type Props = {
  reviews?: Review[];
  averageRating?: number | null;
  reviewsCount?: number;
};

export function HomeReviews({
  reviews = [],
  averageRating,
  reviewsCount = 0
}: Props) {
  const { t } = useTranslation('home');
  const [expandedReviewIds, setExpandedReviewIds] = useState<string[]>([]);
  const [showAll, setShowAll] = useState(false);
  // Identifiants des avis dont le texte depasse reellement la hauteur
  // repliee. Le seuil de 120 caracteres utilise auparavant proposait
  // « Voir plus » sur des commentaires qui tenaient entierement a l'ecran.
  const [truncatedReviewIds, setTruncatedReviewIds] = useState<string[]>([]);

  function handleTextLayout(reviewId: string, lineCount: number) {
    if (lineCount <= COLLAPSED_LINES) return;

    setTruncatedReviewIds((current) =>
      current.includes(reviewId) ? current : [...current, reviewId],
    );
  }

  const displayedReviews = useMemo(() => {
    return showAll ? reviews : reviews.slice(0, 1);
  }, [reviews, showAll]);

  if (reviews.length === 0) {
    return (
      <View style={styles.section}>
        <Text style={styles.title}>
          ★ 0 · {t('reviews.reviewsCount', { count: 0 })}
        </Text>

        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>
            {t('reviews.noReviews')}
          </Text>

          <Text style={styles.emptyText}>
            {t('reviews.noReviewsDescription')}
          </Text>
        </View>
      </View>
    );
  }

  function toggleExpanded(reviewId: string) {
    setExpandedReviewIds((current) =>
      current.includes(reviewId)
        ? current.filter((id) => id !== reviewId)
        : [...current, reviewId],
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.title}>
        ★ {averageRating?.toFixed(1)} ·{' '}
        {t('reviews.reviewsCount', { count: reviewsCount })}
      </Text>

      {displayedReviews.map((review) => {
        const isExpanded = expandedReviewIds.includes(review.id);

        return (
          <View key={review.id} style={styles.card}>
            <View style={styles.reviewHeader}>
              <Text style={styles.stars}>{renderStars(review.score)}</Text>
              <Text style={styles.dot}>·</Text>
              <Text style={styles.date}>{formatReviewDate(review.createdAt)}</Text>
            </View>

            <Text
              style={styles.comment}
              numberOfLines={isExpanded ? undefined : COLLAPSED_LINES}
              onTextLayout={(event) =>
                handleTextLayout(review.id, event.nativeEvent.lines.length)
              }
            >
              {review.comment}
            </Text>

            {truncatedReviewIds.includes(review.id) ? (
              <TouchableOpacity onPress={() => toggleExpanded(review.id)}>
                <Text style={styles.readMore}>
                  {isExpanded ? t('reviews.showLess') : t('reviews.showMore')}
                </Text>
              </TouchableOpacity>
            ) : null}

            <View style={styles.authorRow}>
              <Image
                source={{
                  uri:
                    review.author?.avatarUrl ??
                    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
                }}
                style={styles.avatar}
              />

              <View>
                <Text style={styles.authorName}>
                  {review.author?.firstName}
                </Text>
                <Text style={styles.authorSince}>
                  {t('reviews.hostSinceYears', {
                    count: getHostYears(review.author?.createdAt),
                    defaultValue: `Hôte depuis ${getHostYears(review.author?.createdAt)} ans`,
                  })}
                </Text>
              </View>
            </View>
          </View>
        );
      })}

      {reviews.length > 1 ? (
        <TouchableOpacity
          style={styles.outlineButton}
          onPress={() => setShowAll((current) => !current)}
        >
          <Text style={styles.outlineText}>
            {showAll
              ? t('reviews.showLess')
              : t('reviews.showAllReviews', {
                  count: reviewsCount,
                  defaultValue: `Afficher les ${reviewsCount} commentaires`,
                })}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

function renderStars(score: number) {
  const rounded = Math.round(score);

  return '★★★★★'
    .split('')
    .map((_, index) => (index < rounded ? '★' : '☆'))
    .join('');
}

function formatReviewDate(date: string) {
  const createdAt = new Date(date);
  const now = new Date();

  const diffMs = now.getTime() - createdAt.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 1) return 'aujourd’hui';
  if (diffDays < 30) return `il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) {
    return `il y a ${diffMonths} mois`;
  }

  const diffYears = Math.floor(diffMonths / 12);
  return `il y a ${diffYears} an${diffYears > 1 ? 's' : ''}`;
}

function getHostYears(createdAt?: string | null) {
  if (!createdAt) return 0;

  const created = new Date(createdAt);
  const now = new Date();

  return Math.max(0, now.getFullYear() - created.getFullYear());
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

  emptyCard: {
    backgroundColor: '#F8F8F8',
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 8,
    textAlign: 'center',
  },

  emptyText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#666666',
    textAlign: 'center',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    // Les cartes se suivaient sans respiration : l'ombre portée ne suffit pas à
    // les séparer visuellement quand elles se touchent.
    marginBottom: 14,
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