import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import * as WebBrowser from 'expo-web-browser';

import { BackButton } from 'src/shared/ui/BackButton';
import { ProfileStackParamList } from 'src/navigation/type/profileStack';
import {
  fetchSubscriptionApi,
  openBillingPortalApi,
  type EtatAbonnement,
} from '../infrastructure/subscription.api';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';

type Props = NativeStackScreenProps<
  ProfileStackParamList,
  'SubscriptionManage'
>;

export function SubscriptionManageScreen({ navigation }: Props) {
  const { t, i18n } = useTranslation(['subscription', 'common']);
  const themeColors = useThemeColors();
  const styles = useMemo(() => creerStyles(themeColors), [themeColors]);

  const [etat, setEtat] = useState<EtatAbonnement | null>(null);
  const [occupe, setOccupe] = useState(false);

  const charger = useCallback(async () => {
    try {
      setEtat(await fetchSubscriptionApi());
    } catch (erreur) {
      console.log('Load subscription error:', erreur);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      charger();
    }, [charger]),
  );

  async function ouvrirLaGestion() {
    try {
      setOccupe(true);

      const { url } = await openBillingPortalApi();

      await WebBrowser.openBrowserAsync(url);
      await charger();
    } catch (erreur: any) {
      Alert.alert('', erreur?.message ?? t('subscription:portalUnavailable'));
    } finally {
      setOccupe(false);
    }
  }

  const abonne = Boolean(etat?.actif);
  const venteOuverte = etat?.venteDansLApp !== false;

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.entete}>
        <BackButton onPress={navigation.goBack} style={styles.rond} />
        <Text style={styles.titre}>{t('subscription:manage')}</Text>
        <View style={styles.rond} />
      </View>

      <ScrollView contentContainerStyle={styles.contenu}>
        <View style={styles.carte}>
          <Text style={styles.etat}>
            {abonne
              ? etat?.annuleLe
                ? t('subscription:cancelled', {
                    date: formatDate(etat?.finDePeriode, i18n.language),
                  })
                : t('subscription:activeUntil', {
                    date: formatDate(etat?.finDePeriode, i18n.language),
                  })
              : t('subscription:noSubscription')}
          </Text>
        </View>

        {abonne && !venteOuverte ? (
          <Text style={styles.aide}>{t('subscription:manageOutsideApp')}</Text>
        ) : null}

        {abonne && venteOuverte ? (
          <>
            <TouchableOpacity
              style={[styles.bouton, occupe && styles.boutonInactif]}
              disabled={occupe}
              onPress={ouvrirLaGestion}
              activeOpacity={0.85}
            >
              {occupe ? (
                <ActivityIndicator color={themeColors.onContrast} />
              ) : (
                <Text style={styles.boutonTexte}>
                  {t('subscription:openPortal')}
                </Text>
              )}
            </TouchableOpacity>

            <Text style={styles.aide}>{t('subscription:manageHint')}</Text>
          </>
        ) : null}

        {venteOuverte || !abonne ? (
          <TouchableOpacity
            style={styles.lien}
            onPress={() => navigation.navigate('Subscription')}
            activeOpacity={0.7}
          >
            <Text style={styles.lienTexte}>
              {abonne
                ? t('subscription:changePlan')
                : t('subscription:seeOffer')}
            </Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function formatDate(valeur: string | null | undefined, langue: string) {
  if (!valeur) return '';

  return new Date(valeur).toLocaleDateString(langue, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

const creerStyles = (c: ThemeColors) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.screen },
    entete: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    rond: { width: 36, height: 36 },
    titre: { fontSize: 17, fontWeight: '700', color: c.text },
    contenu: { padding: 16, gap: 14, paddingBottom: 60 },
    carte: {
      backgroundColor: c.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.border,
      padding: 16,
    },
    etat: { fontSize: 15, color: c.text, lineHeight: 21 },
    bouton: {
      backgroundColor: c.contrast,
      borderRadius: 999,
      paddingVertical: 15,
      alignItems: 'center',
    },
    boutonInactif: { opacity: 0.6 },
    boutonTexte: { color: c.onContrast, fontWeight: '700', fontSize: 15 },
    aide: {
      fontSize: 13,
      color: c.textMuted,
      textAlign: 'center',
      lineHeight: 19,
    },
    lien: { alignItems: 'center', paddingVertical: 12 },
    lienTexte: { fontSize: 14, fontWeight: '700', color: c.primary },
  });
