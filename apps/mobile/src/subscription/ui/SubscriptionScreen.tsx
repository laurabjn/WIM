import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import * as WebBrowser from 'expo-web-browser';
import { ChevronDown, ChevronUp, CircleCheck } from 'lucide-react-native';

import { BackButton } from 'src/shared/ui/BackButton';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';
import {
  addPaymentMethodApi,
  applyReferralApi,
  cancelSubscriptionApi,
  fetchPaymentMethodsApi,
  fetchReferralApi,
  fetchSubscriptionApi,
  removePaymentMethodApi,
  setPrimaryPaymentMethodApi,
  simulatePaymentApi,
  startCheckoutApi,
  type EtatAbonnement,
  type EtatParrainage,
  type MoyenDePaiement,
} from '../infrastructure/subscription.api';

type Props = {
  navigation: { goBack: () => void };
};

const AVANTAGES = [
  { titre: 'benefitsFindTitle', lignes: ['benefitsFind1', 'benefitsFind2'] },
  { titre: 'benefitsSafeTitle', lignes: ['benefitsSafe1', 'benefitsSafe2'] },
] as const;

function formatDate(valeur: string | null, langue: string) {
  if (!valeur) return '';

  return new Date(valeur).toLocaleDateString(langue, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export const SubscriptionScreen: React.FC<Props> = ({ navigation }) => {
  const { t, i18n } = useTranslation(['subscription', 'common']);
  const themeColors = useThemeColors();
  const styles = useMemo(() => creerStyles(themeColors), [themeColors]);

  const [abonnement, setAbonnement] = useState<EtatAbonnement | null>(null);
  const [moyens, setMoyens] = useState<MoyenDePaiement[]>([]);
  const [parrainage, setParrainage] = useState<EtatParrainage | null>(null);
  const [occupe, setOccupe] = useState(false);
  const [avantagesOuverts, setAvantagesOuverts] = useState(false);
  const [code, setCode] = useState('');

  const charger = useCallback(async () => {
    try {
      const [etat, liste, filleuls] = await Promise.all([
        fetchSubscriptionApi(),
        fetchPaymentMethodsApi().catch(() => []),
        fetchReferralApi(),
      ]);

      setAbonnement(etat);
      setMoyens(liste);
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

  async function ouvrir(url: string) {
    await WebBrowser.openBrowserAsync(url);
  }

  function souscrire() {
    return agir(async () => {
      const { url } = await startCheckoutApi('YEARLY');

      await ouvrir(url);
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

  function retirerLeMoyen(moyen: MoyenDePaiement) {
    Alert.alert('', t('subscription:removeConfirm'), [
      { text: t('common:cancel'), style: 'cancel' },
      {
        text: t('subscription:remove'),
        style: 'destructive',
        onPress: () =>
          agir(async () => setMoyens(await removePaymentMethodApi(moyen.id))),
      },
    ]);
  }

  const actif = Boolean(abonnement?.actif);
  const resilie = Boolean(abonnement?.annuleLe);
  const enAttente = abonnement?.statut === 'PENDING';
  const venteOuverte = abonnement?.venteDansLApp !== false;
  const abonne = actif || abonnement?.statut === 'CANCELLED';
  const prix = abonnement?.tarifs.YEARLY?.libelle ?? '';

  const principal = moyens.find((moyen) => moyen.principal) ?? null;
  const autres = moyens.filter((moyen) => !moyen.principal);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.entete}>
        <BackButton onPress={navigation.goBack} style={styles.rond} />
        <Text style={styles.titre}>{t('subscription:mine')}</Text>
        <View style={styles.rond} />
      </View>

      <ScrollView contentContainerStyle={styles.contenu}>
        <View style={styles.carte}>
          <View style={[styles.pastille, actif ? styles.pastilleActive : null]}>
            <Text
              style={[
                styles.pastilleTexte,
                actif ? styles.pastilleTexteActive : null,
              ]}
            >
              {actif
                ? t('subscription:statusActive')
                : t('subscription:statusInactive')}
            </Text>
          </View>

          <Text style={styles.formule}>{t('subscription:planName')}</Text>

          <TouchableOpacity
            style={styles.avantagesBouton}
            onPress={() => setAvantagesOuverts((ouvert) => !ouvert)}
            activeOpacity={0.7}
          >
            {avantagesOuverts ? (
              <ChevronUp size={16} color={themeColors.info} />
            ) : (
              <ChevronDown size={16} color={themeColors.info} />
            )}
            <Text style={styles.avantagesLien}>{t('subscription:benefits')}</Text>
          </TouchableOpacity>

          {avantagesOuverts ? (
            <View style={styles.avantages}>
              {AVANTAGES.map((groupe) => (
                <View key={groupe.titre} style={styles.avantagesGroupe}>
                  <Text style={styles.avantagesTitre}>
                    {t(`subscription:${groupe.titre}`)}
                  </Text>

                  {groupe.lignes.map((ligne) => (
                    <View key={ligne} style={styles.avantage}>
                      <CircleCheck size={14} color={themeColors.info} />
                      <Text style={styles.avantageTexte}>
                        {t(`subscription:${ligne}`)}
                      </Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          ) : null}
        </View>

        {actif ? (
          <>
            <Text style={styles.section}>{t('subscription:nextPayment')}</Text>

            {resilie ? (
              <Text style={styles.information}>
                {t('subscription:cancelled', {
                  date: formatDate(abonnement?.finDePeriode ?? null, i18n.language),
                })}
              </Text>
            ) : (
              <View style={styles.lignes}>
                <View style={styles.ligne}>
                  <Text style={styles.ligneLibelle}>
                    {t('subscription:paymentDate')}
                  </Text>
                  <Text style={styles.ligneValeur}>
                    {formatDate(abonnement?.finDePeriode ?? null, i18n.language)}
                  </Text>
                </View>

                <View style={styles.ligne}>
                  <Text style={styles.ligneLibelle}>{t('subscription:price')}</Text>
                  <Text style={styles.ligneValeur}>{prix}</Text>
                </View>
              </View>
            )}

            {resilie ? null : (
              <TouchableOpacity
                style={styles.boutonContour}
                onPress={resilier}
                disabled={occupe}
                activeOpacity={0.8}
              >
                <Text style={styles.boutonContourTexte}>
                  {t('subscription:cancelMine')}
                </Text>
              </TouchableOpacity>
            )}
          </>
        ) : venteOuverte ? (
          <>
            <Text style={styles.information}>{t('subscription:subtitle')}</Text>

            <TouchableOpacity
              style={styles.boutonPlein}
              onPress={souscrire}
              disabled={occupe}
              activeOpacity={0.85}
            >
              <Text style={styles.boutonPleinTexte}>
                {t('subscription:subscribe')}
                {prix ? ` · ${prix}` : ''}
              </Text>
            </TouchableOpacity>

            <Text style={styles.aide}>{t('subscription:yearlyHint')}</Text>

            {enAttente ? (
              <TouchableOpacity
                style={styles.boutonContour}
                onPress={() => agir(simulatePaymentApi)}
                disabled={occupe}
                activeOpacity={0.8}
              >
                <Text style={styles.boutonContourTexte}>
                  {t('subscription:simulate')}
                </Text>
              </TouchableOpacity>
            ) : null}
          </>
        ) : (
          <Text style={styles.information}>
            {t('subscription:saleOutsideApp')}
          </Text>
        )}

        {abonne ? (
          <>
            <Text style={styles.section}>{t('subscription:paymentMethods')}</Text>

            {moyens.length === 0 ? (
              <Text style={styles.information}>
                {t('subscription:noPaymentMethod')}
              </Text>
            ) : null}

            {principal ? (
              <>
                <Text style={styles.sousSection}>{t('subscription:primary')}</Text>

                <View style={styles.moyen}>
                  <View style={styles.moyenTexte}>
                    <Text style={styles.moyenLibelle}>
                      <Text style={styles.moyenMarque}>{principal.libelle}</Text>
                      {principal.type === 'paypal'
                        ? ` ${principal.detail}`
                        : ` ${t('subscription:endingIn', { last4: principal.detail })}`}
                    </Text>

                    <TouchableOpacity
                      onPress={() => retirerLeMoyen(principal)}
                      disabled={occupe}
                    >
                      <Text style={styles.moyenAction}>
                        {t('subscription:remove')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            ) : null}

            {autres.length > 0 ? (
              <>
                <Text style={styles.sousSection}>
                  {t('subscription:otherMethods')}
                </Text>

                {autres.map((moyen) => (
                  <View key={moyen.id} style={styles.moyen}>
                    <View style={styles.moyenTexte}>
                      <Text style={styles.moyenLibelle}>
                        <Text style={styles.moyenMarque}>{moyen.libelle}</Text>
                        {moyen.type === 'paypal'
                          ? ` ${moyen.detail}`
                          : ` ${t('subscription:endingIn', { last4: moyen.detail })}`}
                      </Text>

                      <View style={styles.moyenActions}>
                        <TouchableOpacity
                          onPress={() =>
                            agir(async () =>
                              setMoyens(await setPrimaryPaymentMethodApi(moyen.id)),
                            )
                          }
                          disabled={occupe}
                        >
                          <Text style={styles.moyenAction}>
                            {t('subscription:setPrimary')}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => retirerLeMoyen(moyen)}
                          disabled={occupe}
                        >
                          <Text style={styles.moyenAction}>
                            {t('subscription:remove')}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}
              </>
            ) : null}

            {venteOuverte ? (
              <TouchableOpacity
                style={styles.boutonContour}
                onPress={() =>
                  agir(async () => {
                    const { url } = await addPaymentMethodApi();

                    await ouvrir(url);
                  })
                }
                disabled={occupe}
                activeOpacity={0.8}
              >
                <Text style={styles.boutonContourTexte}>
                  {t('subscription:addMethod')}
                </Text>
              </TouchableOpacity>
            ) : null}
          </>
        ) : null}

        <Text style={styles.section}>{t('subscription:referralTitle')}</Text>
        <Text style={styles.information}>{t('subscription:referralHint')}</Text>

        {parrainage ? (
          <View style={styles.carte}>
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
              style={styles.boutonContour}
              onPress={() =>
                Share.share({
                  message: `${t('subscription:referralHint')} ${parrainage.code}`,
                }).catch(() => undefined)
              }
              activeOpacity={0.8}
            >
              <Text style={styles.boutonContourTexte}>
                {t('subscription:share')}
              </Text>
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
    contenu: { padding: 16, gap: 10, paddingBottom: 120 },
    section: {
      fontSize: 13,
      fontWeight: '700',
      color: c.text,
      marginTop: 14,
    },
    sousSection: { fontSize: 12, color: c.textMuted, marginTop: 4 },
    information: { fontSize: 13, lineHeight: 19, color: c.textMuted },
    aide: { fontSize: 12, color: c.textMuted, textAlign: 'center' },
    carte: {
      backgroundColor: c.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.border,
      padding: 16,
      gap: 8,
    },
    pastille: {
      alignSelf: 'flex-start',
      backgroundColor: c.surfaceAlt,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 3,
    },
    pastilleActive: { backgroundColor: c.accent },
    pastilleTexte: { fontSize: 11, fontWeight: '700', color: c.textMuted },
    pastilleTexteActive: { color: '#FFFFFF' },
    formule: { fontSize: 18, fontWeight: '700', color: c.text },
    avantagesBouton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    avantagesLien: {
      fontSize: 12,
      color: c.info,
      textDecorationLine: 'underline',
    },
    avantages: { gap: 12, marginTop: 4 },
    avantagesGroupe: { gap: 6 },
    avantagesTitre: { fontSize: 13, fontWeight: '700', color: c.text },
    avantage: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    avantageTexte: { flex: 1, fontSize: 12, color: c.text },
    lignes: { gap: 10 },
    ligne: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    ligneLibelle: { fontSize: 13, color: c.textMuted },
    ligneValeur: { fontSize: 13, color: c.text },
    boutonContour: {
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.surface,
      borderRadius: 12,
      paddingVertical: 13,
      alignItems: 'center',
      marginTop: 4,
    },
    boutonContourTexte: { fontSize: 13, fontWeight: '600', color: c.text },
    boutonPlein: {
      backgroundColor: c.contrast,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: 'center',
    },
    boutonPleinTexte: { color: c.onContrast, fontWeight: '700', fontSize: 14 },
    moyen: {
      backgroundColor: c.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.border,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    moyenTexte: { gap: 4 },
    moyenLibelle: { fontSize: 13, color: c.text },
    moyenMarque: { fontWeight: '700' },
    moyenActions: { flexDirection: 'row', gap: 16 },
    moyenAction: {
      fontSize: 11,
      color: c.textMuted,
      textDecorationLine: 'underline',
    },
    codeLibelle: { fontSize: 13, color: c.textMuted },
    code: { fontSize: 26, fontWeight: '800', letterSpacing: 3, color: c.text },
    compteurs: { flexDirection: 'row', gap: 16 },
    compteur: { fontSize: 13, color: c.textMuted },
    saisie: { flexDirection: 'row', gap: 10, alignItems: 'center' },
    champ: {
      flex: 1,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      color: c.text,
      backgroundColor: c.surface,
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
