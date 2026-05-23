import { Home } from '@wim/shared/home/home.type';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

type Props = {
  home: Home;
  onPressEdit: (homeId: string) => void;
  onPressCard?: (homeId: string) => void;
  hideEditButton?: boolean;
};

export function UserHomeCard({ home, onPressEdit, onPressCard, hideEditButton }: Props) {
  const { t } = useTranslation('profile');
    
  const coverUrl =
    home.photos?.[0]?.url ??
    'https://via.placeholder.com/400x220.png?text=Home';

  const hostRating = home.owner?.rating ?? null;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onPressCard?.(home.id)}
      style={styles.card}
    >
      <View>
        <Image
          source={{
            uri:
              coverUrl,
          }}
          style={styles.image}
        />

        {!hideEditButton && (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => onPressEdit(home.id)}
          >
            <Text style={styles.editIcon}>✎</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {home.title}
          </Text>
          <Text style={styles.rating}>
            ★ {home.owner.rating ?? '0.0'}
          </Text>
        </View>

        <Text style={styles.location}>
          {home.city}, {home.country}
        </Text>

        <Text style={styles.details}>
          {home.bedrooms ?? 0} {t('bedrooms')} • {home.beds ?? 0} {t('beds')}
        </Text>

        <View style={styles.bottomRow}>
          {home.isAvailableForExchange ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{t('available')}</Text>
            </View>
          ) : (
            <View style={[styles.badge, styles.badgeUnavailable]}>
              <Text style={styles.badgeText}>{t('unavailable')}</Text>
            </View>
          )}

          <Text style={styles.price}>
            {t('price')} {home.pricePerNight ?? 0}€
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 210,
    backgroundColor: '#DDD',
  },
  editButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFFEE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editIcon: {
    fontSize: 14,
  },
  content: {
    padding: 14,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
    color: '#1F1F1F',
  },
  rating: {
    fontSize: 12,
    color: '#444',
  },
  location: {
    marginTop: 4,
    fontSize: 12,
    color: '#666',
  },
  details: {
    marginTop: 6,
    fontSize: 12,
    color: '#444',
  },
  bottomRow: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: '#D8F5DF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  badgeUnavailable: {
    backgroundColor: '#F5D8D8',
  },
  badgeText: {
    fontSize: 11,
    color: '#267A40',
    fontWeight: '600',
  },
  price: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F1F1F',
  },
});