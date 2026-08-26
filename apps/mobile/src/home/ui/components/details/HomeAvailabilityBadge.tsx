import { Home } from '@wim/shared/home/home.type';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';

type Props = {
  home: Home;
  onPressContact: () => void;
  exchangeStatus?: 'PENDING' | 'FUTURE' | 'CURRENT' | null;
};

function formatJour(valeur: string) {
  return new Date(valeur).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
  });
}

export function HomeAvailabilityBadge({
  home,
  onPressContact,
  exchangeStatus,
}: Props) {
  const { t } = useTranslation("common");
  const themeColors = useThemeColors();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);
  // Annoncer « disponibilité libre » a tout le monde ne dit rien : ce sont les
  // periodes reellement ouvertes qui interessent celui qui demande.
  function getAvailabilityLabel(home: Home) {
    const maintenant = Date.now();

    const periodes = (home.availabilities ?? [])
      .filter((availability) => availability.type === 'AVAILABLE')
      .filter((availability) => Date.parse(availability.endDate) >= maintenant)
      .sort((a, b) => Date.parse(a.startDate) - Date.parse(b.startDate));

    if (periodes.length === 0) {
      return t('noAvailability');
    }

    const prochaine = periodes[0];

    const fenetre = t('availableBetween', {
      debut: formatJour(prochaine.startDate),
      fin: formatJour(prochaine.endDate),
    });

    return periodes.length > 1
      ? `${fenetre} +${periodes.length - 1}`
      : fenetre;
  }
    
  return (
    <View style={styles.availabilityCard}>
        <View style={styles.availabilityLeft}>
            <Text style={styles.availabilityIcon}>▦</Text>
            <Text style={styles.availabilityText}>
            {getAvailabilityLabel(home)}
            </Text>
        </View>

        {exchangeStatus ? (
            <View style={styles.exchangeTag}>
                <Text style={styles.exchangeTagText}>
                    {t(`exchangeState.${exchangeStatus}`)}
                </Text>
            </View>
        ) : (
            <TouchableOpacity
                style={styles.contactButton}
                onPress={onPressContact}
            >
                <Text style={styles.contactText}>{t("contact")}</Text>
            </TouchableOpacity>
        )}
    </View>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
  // Meme pastille que sur les fiches de logement du compte : un etat se lit
  // pareil d'un ecran a l'autre.
  exchangeTag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: '#D8F5DF',
  },

  exchangeTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#267A40',
  },

  availabilityCard: {
    marginHorizontal: 12,
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 18,
    backgroundColor: c.surfaceAlt,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  availabilityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  availabilityIcon: {
    fontSize: 16,
    marginRight: 8,
    color: c.text,
  },

  availabilityText: {
    fontSize: 13,
    color: c.text,
    fontWeight: '500',
  },

  contactButton: {
    width: 118,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#24AEE4',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 28,
  },

  contactText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});