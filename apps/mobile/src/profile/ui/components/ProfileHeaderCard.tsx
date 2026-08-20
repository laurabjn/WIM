import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { LanguagePills } from './LanguagePills';
import { ProfileStatsRow } from './ProfileStatsRow';
import { UserProfile } from '@wim/shared';
import { useTranslation } from 'react-i18next';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';

type Props = {
  profile: UserProfile;
  onPressEdit: () => void;
  hideEditButton?: boolean;
};

export function ProfileHeaderCard({ profile, onPressEdit, hideEditButton }: Props) {
    const { t } = useTranslation('profile');
    const themeColors = useThemeColors();
    const styles = useMemo(() => createStyles(themeColors), [themeColors]);
    
    function calculateAgeFromString(birthDate: string | null): number | null {
        if (!birthDate) return null;

        const birth = new Date(birthDate);
        const today = new Date();

        let age = today.getFullYear() - birth.getFullYear();

        const hasBirthdayPassed =
            today.getMonth() > birth.getMonth() ||
            (today.getMonth() === birth.getMonth() &&
            today.getDate() >= birth.getDate());

        if (!hasBirthdayPassed) age--;

        return age;
    }
    
  const fullName = `${profile.firstName} ${profile.lastName}`;
  const age = calculateAgeFromString(profile.birthDate);
  const ageText = age ? `${age} ${t('profile:years')}` : '';
  const rating = profile.averageRating ?? 0;
  const reviewsCount = profile.reviewsCount ?? 0;
  const exchangesCount = profile.exchangesCount ?? 0;
  const homesCount = profile.homesCount ?? 0;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.userRow}>
          <Image
            source={{
              uri:
                profile.avatarUrl ??
                'https://via.placeholder.com/64x64.png?text=User',
            }}
            style={styles.avatar}
          />

          <View style={styles.identityBlock}>
            <Text style={styles.name}>{fullName}</Text>
            {!!ageText && <Text style={styles.age}>{ageText}</Text>}
            <Text style={styles.rating}>
              ★ {rating.toFixed(1)} ({reviewsCount} {t('profile:reviews')})
            </Text>
          </View>
        </View>

        {!hideEditButton && (
          <TouchableOpacity style={styles.editButton} onPress={onPressEdit}>
            <Text style={styles.editIcon}>✎</Text>
          </TouchableOpacity>
        )}
      </View>

      {!!profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}

      <LanguagePills languages={profile.languages ?? []} />

      <ProfileStatsRow
        exchangesCount={exchangesCount}
        reviewsCount={reviewsCount}
        homesCount={homesCount}
      />
    </View>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
  card: {
    backgroundColor: c.surface,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  userRow: {
    flexDirection: 'row',
    flex: 1,
    paddingRight: 12,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: c.surfaceAlt,
  },
  identityBlock: {
    marginLeft: 12,
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: c.text,
  },
  age: {
    fontSize: 12,
    color: c.textMuted,
    marginTop: 2,
  },
  rating: {
    fontSize: 12,
    color: c.text,
    marginTop: 6,
  },
  editButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: c.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editIcon: {
    color: c.text,
    fontSize: 14,
  },
  bio: {
    marginTop: 14,
    fontSize: 13,
    lineHeight: 19,
    color: c.text,
  },
});