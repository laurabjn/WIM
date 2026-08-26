import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { BackButton } from 'src/shared/ui/BackButton';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';
import {
  applyReferralApi,
  cancelSubscriptionApi,
  fetchReferralApi,
  fetchSubscriptionApi,
  simulatePaymentApi,
  startCheckoutApi,
  type EtatAbonnement,
  type EtatParrainage,
  type PlanAbonnement,
} from '../infrastructure/subscription.api';

type Props = {
  navigation: { goBack: () => void };
};

function formatDate(valeur: string | null) {
  if (!valeur) return '';

  return new Date(valeur).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export const SubscriptionScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation(['subscription', 'common']);
  const themeColors = useThemeColors();
  const styles = useMemo(() => creerStyles(themeColors), [themeColors]);

  const [abonnement, setAbonnement] = useState<EtatAbonnement | null>(null);
  const [parrainage, setParrainage] = useState<EtatParrainage | null>(null);
  const [occupe, setOccupe] = useState(false);
  const [code, setCode] = useState('');

  const charger = useCallback(async () => {
    try {
      const [etat, filleuls] = await Promise.all([
        fetchSubscriptionApi(),
        fetchReferralApi(),
      ]);

      setAbonnement(etat);
      setParrainage(filleuls);
    } catch (error) {
      console.log('Load subscription error:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      charger();
    }, [charger]),
  );

  async function agir(action: () => Promise<unknown>) {
    if (occupe) return;

    setOccupe(true);

    try {
      await action();
      await charger();
    } catch (error: any) {
      Alert.alert('', error?.message ?? t('subscription:error'));
    } finally {
      setOccupe(false);
    }
  }

  function souscrire(plan: PlanAbonnement) {
    return agir(async () => {
      const { url } = await startCheckoutApi(plan);

      await Linking.openURL(url).catch(() => undefined);
    });
  }

  function resilier() {
    Alert.alert('', t('subscription:cancelConfirm'), [
      { text: t('common:cancel'), style: 'cancel' },
      {
        text: t('subscription:cancel'),
        style: 'destructive',
        onPress: () => agir(cancelSubscriptionApi),
      },
    ]);
  }

  const enAttente = abonnement?.statut === 'PENDING';

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.entete}>
        <BackButton onPress={navigation.goBack} style={styles.rond} />
        <Text style={styles.titre}>{t('subscription:title')}</Text>
        <View style={styles.rond} />
      </View>

      <ScrollView contentContainerStyle={styles.contenu}>
        <Text style={styles.sousTitre}>{t('subscription:subtitle')}</Text>

        {abonnement?.actif ? (
          <View style={styles.carteActive}>
            <Text style={styles.etat}>
              {abonnement.annuleLe
                ? t('subscription:cancelled', {
                    date: formatDate(abonnement.finDePeriode),
                  })
                : t('subscription:activeUntil', {
                    date: formatDate(abonnement.finDePeriode),
                  })}
            </Text>

            {abonnement.annuleLe ? null : (
              <TouchableOpacity onPress={resilier} disabled={occupe}>
                <Text style={styles.resilier}>{t('subscription:cancel')}</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <>
            {(
              [
                ['MONTHLY', 'monthly', 'monthlyHint'],
                ['YEARLY', 'yearly', 'yearlyHint'],
              ] as const
            ).map(([plan, titre, aide]) => (
              <TouchableOpacity
                key={plan}
                style={styles.formule}
                onPress={() => souscrire(plan)}
                disabled={occupe}
                activeOpacity={0.85}
              >
                <View style={styles.formuleTexte}>
                  <Text style={styles.formuleTitre}>
                    {t(`subscription:${titre}`)}
                  </Text>
                  <Text style={styles.formuleAide}>
                    {t(`subscription:${aide}`)}
                  </Text>
                </View>

                <Text style={styles.formuleAction}>
                  {t('subscription:subscribe')}
                </Text>
              </TouchableOpacity>
            ))}

            {enAttente ? (
              <View style={styles.simulation}>
                <Text style={styles.simulationAide}>
                  {t('subscription:simulateHint')}
                </Text>

                <TouchableOpacity
                  style={styles.simulationBouton}
                  onPress={() => agir(simulatePaymentApi)}
                  disabled={occupe}
                >
                  <Text style={styles.simulationTexte}>
                    {t('subscription:simulate')}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </>
        )}

        <Text style={styles.section}>{t('subscription:referralTitle')}</Text>
        <Text style={styles.sousTitre}>{t('subscription:referralHint')}</Text>

        {parrainage ? (
          <View style={styles.carteParrainage}>
            <Text style={styles.codeLibelle}>{t('subscription:yourCode')}</Text>
            <Text style={styles.code}>{parrainage.code}</Text>

            <View style={styles.compteurs}>
              <Text style={styles.compteur}>
                {parrainage.filleuls} {t('subscription:godchildren')}
              </Text>
              <Text style={styles.compteur}>
                {parrainage.recompenses} {t('subscription:rewarded')}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.partager}
              onPress={() =>
                Share.share({
                  message: `${t('subscription:referralHint')} ${parrainage.code}`,
                }).catch(() => undefined)
              }
            >
              <Text style={styles.partagerTexte}>{t('subscription:share')}</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {parrainage && !parrainage.parraine ? (
          <View style={styles.saisie}>
            <TextInput
              value={code}
              onChangeText={setCode}
              placeholder={t('subscription:enterCode')}
              placeholderTextColor={themeColors.textFaint}
              autoCapitalize="characters"
              style={styles.champ}
            />

            <TouchableOpacity
              style={styles.valider}
              disabled={occupe || code.trim().length === 0}
              onPress={() =>
                agir(async () => {
                  await applyReferralApi(code);
                  setCode('');
                })
              }
            >
              <Text style={styles.validerTexte}>{t('subscription:apply')}</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {occupe ? (
          <ActivityIndicator style={styles.chargement} color={themeColors.text} />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

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
    contenu: { padding: 16, gap: 12, paddingBottom: 120 },
    sousTitre: { fontSize: 14, lineHeight: 20, color: c.textMuted },
    section: {
      fontSize: 16,
      fontWeight: '700',
      color: c.text,
      marginTop: 24,
    },
    formule: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: c.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.border,
      padding: 16,
    },
    formuleTexte: { flex: 1, gap: 2 },
    formuleTitre: { fontSize: 15, fontWeight: '700', color: c.text },
    formuleAide: { fontSize: 13, color: c.textMuted },
    formuleAction: { fontSize: 14, fontWeight: '700', color: c.primary },
    carteActive: {
      backgroundColor: c.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.border,
      padding: 16,
      gap: 10,
    },
    etat: { fontSize: 15, fontWeight: '600', color: c.text },
    resilier: { fontSize: 14, color: c.danger },
    simulation: {
      backgroundColor: c.surfaceAlt,
      borderRadius: 16,
      padding: 16,
      gap: 10,
    },
    simulationAide: { fontSize: 13, lineHeight: 19, color: c.textMuted },
    simulationBouton: {
      backgroundColor: c.contrast,
      borderRadius: 999,
      paddingVertical: 13,
      alignItems: 'center',
    },
    simulationTexte: { color: c.onContrast, fontWeight: '600' },
    carteParrainage: {
      backgroundColor: c.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.border,
      padding: 16,
      gap: 8,
    },
    codeLibelle: { fontSize: 13, color: c.textMuted },
    code: { fontSize: 26, fontWeight: '800', letterSpacing: 3, color: c.text },
    compteurs: { flexDirection: 'row', gap: 16 },
    compteur: { fontSize: 13, color: c.textMuted },
    partager: {
      marginTop: 4,
      backgroundColor: c.contrast,
      borderRadius: 999,
      paddingVertical: 13,
      alignItems: 'center',
    },
    partagerTexte: { color: c.onContrast, fontWeight: '600' },
    saisie: { flexDirection: 'row', gap: 10, alignItems: 'center' },
    champ: {
      flex: 1,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      color: c.text,
    },
    valider: {
      backgroundColor: c.contrast,
      borderRadius: 12,
      paddingHorizontal: 18,
      paddingVertical: 13,
    },
    validerTexte: { color: c.onContrast, fontWeight: '600' },
    chargement: { marginTop: 12 },
  });
