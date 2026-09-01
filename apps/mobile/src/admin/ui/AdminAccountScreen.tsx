import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { getSession } from 'src/auth/infrastructure/authStorage';
import { BackButton } from 'src/shared/ui/BackButton';
import { setUserSuspensionApi } from '../infrastructure/admin.api';
import {
  getAccountFileApi,
  type DossierCompte,
} from '../infrastructure/adminExtras.api';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';

type Props = {
  route: { params: { userId: string } };
  navigation: { goBack: () => void };
};

function enDate(valeur: string | null) {
  return valeur ? new Date(valeur).toLocaleDateString() : null;
}

export const AdminAccountScreen: React.FC<Props> = ({ route, navigation }) => {
  const { userId } = route.params;
  const { t } = useTranslation(['admin', 'common']);
  const themeColors = useThemeColors();
  const styles = useMemo(() => creerStyles(themeColors), [themeColors]);

  const [dossier, setDossier] = useState<DossierCompte | null>(null);
  const [enCours, setEnCours] = useState(false);

  const charger = useCallback(async () => {
    try {
      const session = await getSession();

      if (!session?.accessToken) return;

      setDossier(await getAccountFileApi(session.accessToken, userId));
    } catch (error) {
      console.log('Load account file error:', error);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      charger();
    }, [charger]),
  );

  async function basculerSuspension() {
    if (!dossier) return;

    const suspendu = Boolean(dossier.compte.suspendedAt);

    Alert.alert(
      suspendu ? t('admin:restoreTitle') : t('admin:suspendTitle'),
      suspendu ? t('admin:restoreConfirm') : t('admin:suspendConfirm'),
      [
        { text: t('admin:cancel'), style: 'cancel' },
        {
          text: suspendu ? t('admin:restore') : t('admin:suspend'),
          style: suspendu ? 'default' : 'destructive',
          onPress: async () => {
            try {
              setEnCours(true);

              const session = await getSession();

              if (!session?.accessToken) return;

              await setUserSuspensionApi(
                session.accessToken,
                dossier.compte.id,
                !suspendu,
              );

              await charger();
            } catch (error) {
              console.log('Suspend error:', error);
              Alert.alert('', t('admin:actionError'));
            } finally {
              setEnCours(false);
            }
          },
        },
      ],
    );
  }

  if (!dossier) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
        <View style={styles.entete}>
          <BackButton onPress={navigation.goBack} style={styles.rond} />
          <Text style={styles.titre}>{t('admin:account.title')}</Text>
          <View style={styles.rond} />
        </View>

        <ActivityIndicator style={styles.chargement} color={themeColors.text} />
      </SafeAreaView>
    );
  }

  const { compte, signalements, logements } = dossier;
  const suspendu = Boolean(compte.suspendedAt);

  const chiffres: { libelle: string; valeur: number | string }[] = [
    {
      libelle: t('admin:account.reportsReceived'),
      valeur: compte.signalementsRecus,
    },
    {
      libelle: t('admin:account.distinctReporters'),
      valeur: compte.auteursDistincts,
    },
    { libelle: t('admin:account.homes'), valeur: compte.logements },
    { libelle: t('admin:account.messages'), valeur: compte.messages },
    { libelle: t('admin:account.reviews'), valeur: compte.avis },
    {
      libelle: t('admin:account.reportsMade'),
      valeur: compte.signalementsEmis,
    },
  ];

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.entete}>
        <BackButton onPress={navigation.goBack} style={styles.rond} />
        <Text style={styles.titre}>{t('admin:account.title')}</Text>
        <View style={styles.rond} />
      </View>

      <ScrollView contentContainerStyle={styles.contenu}>
        <View style={styles.carte}>
          <View style={styles.identite}>
            {compte.avatarUrl ? (
              <Image source={{ uri: compte.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarVide]} />
            )}

            <View style={styles.identiteTexte}>
              <Text style={styles.nom} numberOfLines={1}>
                {compte.firstName} {compte.lastName}
              </Text>
              <Text style={styles.email} numberOfLines={1}>
                {compte.email}
              </Text>
            </View>

            {suspendu ? (
              <Text style={styles.etiquette}>{t('admin:suspended')}</Text>
            ) : null}
          </View>

          {compte.bio ? <Text style={styles.bio}>{compte.bio}</Text> : null}

          <View style={styles.ligne}>
            <Text style={styles.libelle}>{t('admin:account.memberSince')}</Text>
            <Text style={styles.valeur}>{enDate(compte.createdAt)}</Text>
          </View>

          <View style={styles.ligne}>
            <Text style={styles.libelle}>{t('admin:account.lastSeen')}</Text>
            <Text style={styles.valeur}>
              {enDate(compte.lastSeenAt) ?? t('admin:account.neverSeen')}
            </Text>
          </View>

          <View style={styles.ligne}>
            <Text style={styles.libelle}>{t('admin:account.identity')}</Text>
            <Text style={styles.valeur}>
              {t(
                `admin:identity.${compte.identityStatus}`,
                compte.identityStatus,
              )}
            </Text>
          </View>
        </View>

        <View style={styles.grille}>
          {chiffres.map((chiffre) => (
            <View key={chiffre.libelle} style={styles.case}>
              <Text style={styles.caseValeur}>{chiffre.valeur}</Text>
              <Text style={styles.caseLibelle}>{chiffre.libelle}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.section}>{t('admin:account.reportsHeading')}</Text>

        {signalements.map((signalement) => (
          <View key={signalement.id} style={styles.carte}>
            <View style={styles.signalementEntete}>
              <Text style={styles.motif}>{signalement.reason}</Text>
              <Text
                style={[
                  styles.etat,
                  signalement.handledAt
                    ? styles.etatTraite
                    : styles.etatAttente,
                ]}
              >
                {signalement.handledAt
                  ? t('admin:account.handled')
                  : t('admin:account.pending')}
              </Text>
            </View>

            <Text
              style={[styles.detail, !signalement.message && styles.detailVide]}
            >
              {signalement.message ?? t('admin:account.noDetail')}
            </Text>

            {signalement.review ? (
              <View style={styles.avis}>
                <Text style={styles.avisTitre}>
                  {t('admin:account.reportedReview')} ·{' '}
                  {signalement.review.score}/5
                </Text>
                <Text style={styles.detail}>{signalement.review.comment}</Text>
              </View>
            ) : null}

            <Text style={styles.meta}>
              {t('admin:reportedBy', {
                nom: `${signalement.reporter.firstName ?? ''} ${
                  signalement.reporter.lastName ?? ''
                }`.trim(),
              })}
              {' · '}
              {enDate(signalement.createdAt)}
            </Text>
          </View>
        ))}

        <Text style={styles.section}>{t('admin:account.homesHeading')}</Text>

        {logements.length === 0 ? (
          <View style={styles.carte}>
            <Text style={styles.detailVide}>{t('admin:account.noHomes')}</Text>
          </View>
        ) : (
          logements.map((logement) => (
            <View key={logement.id} style={styles.logement}>
              {logement.photo ? (
                <Image
                  source={{ uri: logement.photo }}
                  style={styles.logementPhoto}
                />
              ) : (
                <View style={[styles.logementPhoto, styles.avatarVide]} />
              )}

              <View style={styles.logementTexte}>
                <Text style={styles.nom} numberOfLines={1}>
                  {logement.title}
                </Text>
                <Text style={styles.email} numberOfLines={1}>
                  {logement.city}, {logement.country}
                </Text>
                <Text style={styles.caseLibelle}>
                  {logement.ouvert
                    ? t('admin:account.openToExchange')
                    : t('admin:account.closedToExchange')}
                </Text>
              </View>
            </View>
          ))
        )}

        <TouchableOpacity
          style={[styles.action, suspendu && styles.actionRetablir]}
          disabled={enCours}
          onPress={basculerSuspension}
        >
          {enCours ? (
            <ActivityIndicator size="small" color={themeColors.onContrast} />
          ) : (
            <Text style={styles.actionTexte}>
              {suspendu ? t('admin:restore') : t('admin:suspend')}
            </Text>
          )}
        </TouchableOpacity>
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
    chargement: { marginTop: 40 },
    contenu: { padding: 12, gap: 10, paddingBottom: 32 },
    carte: {
      backgroundColor: c.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.border,
      padding: 14,
      gap: 8,
    },
    identite: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    avatar: { width: 52, height: 52, borderRadius: 26 },
    avatarVide: { backgroundColor: c.surfaceAlt },
    identiteTexte: { flex: 1, gap: 2 },
    nom: { fontSize: 15, fontWeight: '800', color: c.text },
    email: { fontSize: 13, color: c.textMuted },
    etiquette: {
      fontSize: 11,
      fontWeight: '800',
      color: c.danger,
      textTransform: 'uppercase',
    },
    bio: { fontSize: 13, lineHeight: 19, color: c.textMuted },
    ligne: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    libelle: { flex: 1, fontSize: 13, color: c.textMuted },
    valeur: { fontSize: 13, fontWeight: '700', color: c.text },
    grille: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    case: {
      flexBasis: '31%',
      flexGrow: 1,
      backgroundColor: c.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.border,
      paddingVertical: 12,
      paddingHorizontal: 8,
      alignItems: 'center',
      gap: 2,
    },
    caseValeur: { fontSize: 19, fontWeight: '800', color: c.text },
    caseLibelle: { fontSize: 11, color: c.textMuted, textAlign: 'center' },
    section: {
      fontSize: 13,
      fontWeight: '800',
      color: c.textMuted,
      textTransform: 'uppercase',
      marginTop: 8,
    },
    signalementEntete: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
    },
    motif: { flex: 1, fontSize: 15, fontWeight: '700', color: c.text },
    etat: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
    etatTraite: { color: c.textFaint },
    etatAttente: { color: c.danger },
    detail: { fontSize: 14, lineHeight: 20, color: c.text },
    detailVide: { color: c.textFaint, fontStyle: 'italic' },
    avis: {
      backgroundColor: c.surfaceAlt,
      borderRadius: 10,
      padding: 10,
      gap: 4,
    },
    avisTitre: { fontSize: 12, fontWeight: '800', color: c.textMuted },
    meta: { fontSize: 12, color: c.textFaint },
    logement: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: c.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.border,
      padding: 10,
    },
    logementPhoto: { width: 56, height: 56, borderRadius: 10 },
    logementTexte: { flex: 1, gap: 2 },
    action: {
      marginTop: 12,
      backgroundColor: c.contrast,
      borderRadius: 999,
      paddingVertical: 15,
      alignItems: 'center',
    },
    actionRetablir: { backgroundColor: c.primary },
    actionTexte: { color: c.onContrast, fontWeight: '700' },
  });
