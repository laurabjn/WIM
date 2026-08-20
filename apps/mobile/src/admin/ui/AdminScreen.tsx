import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { getSession } from 'src/auth/infrastructure/authStorage';
import {
  getReportsApi,
  markReportHandledApi,
  setUserSuspensionApi,
  type ModerationReport,
} from '../infrastructure/admin.api';
import { BackButton } from 'src/shared/ui/BackButton';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';

type Props = {
  navigation: { goBack: () => void };
};

export function AdminScreen({ navigation }: Props) {
  const { t } = useTranslation('admin');
  const themeColors = useThemeColors();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);

  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [chargement, setChargement] = useState(true);
  const [enAttenteSeulement, setEnAttenteSeulement] = useState(true);
  const [enCours, setEnCours] = useState<string | null>(null);

  const charger = useCallback(async () => {
    try {
      const session = await getSession();

      if (!session?.accessToken) return;

      setReports(await getReportsApi(session.accessToken, enAttenteSeulement));
    } catch (error) {
      console.log('Load reports error:', error);
      Alert.alert('', t('loadError'));
    } finally {
      setChargement(false);
    }
  }, [enAttenteSeulement, t]);

  useFocusEffect(
    useCallback(() => {
      charger();
    }, [charger]),
  );

  async function basculerTraitement(report: ModerationReport) {
    setEnCours(report.id);

    try {
      const session = await getSession();

      if (!session?.accessToken) return;

      await markReportHandledApi(
        session.accessToken,
        report.id,
        !report.handledAt,
      );

      await charger();
    } catch (error) {
      console.log('Mark handled error:', error);
      Alert.alert('', t('actionError'));
    } finally {
      setEnCours(null);
    }
  }

  function confirmerSuspension(report: ModerationReport) {
    const suspendre = !report.reported.suspendedAt;

    const nom =
      `${report.reported.firstName} ${report.reported.lastName}`.trim();

    Alert.alert(
      suspendre ? t('suspendTitle') : t('restoreTitle'),
      suspendre ? t('suspendConfirm', { nom }) : t('restoreConfirm', { nom }),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: suspendre ? t('suspend') : t('restore'),
          style: suspendre ? 'destructive' : 'default',
          onPress: () => appliquerSuspension(report, suspendre),
        },
      ],
    );
  }

  async function appliquerSuspension(
    report: ModerationReport,
    suspendre: boolean,
  ) {
    setEnCours(report.id);

    try {
      const session = await getSession();

      if (!session?.accessToken) return;

      await setUserSuspensionApi(
        session.accessToken,
        report.reported.id,
        suspendre,
      );

      await charger();
    } catch (error) {
      console.log('Suspend error:', error);
      Alert.alert('', t('actionError'));
    } finally {
      setEnCours(null);
    }
  }

  function renderReport({ item }: { item: ModerationReport }) {
    const suspendu = Boolean(item.reported.suspendedAt);

    const signalePar =
      `${item.reporter.firstName} ${item.reporter.lastName}`.trim();

    return (
      <View style={[styles.carte, item.handledAt ? styles.carteTraitee : null]}>
        <View style={styles.entete}>
          {item.reported.avatarUrl ? (
            <Image
              source={{ uri: item.reported.avatarUrl }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatar, styles.avatarVide]} />
          )}

          <View style={styles.identite}>
            <Text style={styles.nom} numberOfLines={1}>
              {item.reported.firstName} {item.reported.lastName}
            </Text>

            <Text style={styles.email} numberOfLines={1}>
              {item.reported.email}
            </Text>
          </View>

          {suspendu ? (
            <Text style={styles.etiquetteSuspendu}>{t('suspended')}</Text>
          ) : null}
        </View>

        <Text style={styles.motif}>{item.reason}</Text>

        {item.message ? (
          <Text style={styles.message}>{item.message}</Text>
        ) : null}

        <Text style={styles.meta}>
          {t('reportedBy', { nom: signalePar })}
          {' · '}
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.action}
            disabled={enCours === item.id}
            onPress={() => basculerTraitement(item)}
          >
            <Text style={styles.actionTexte}>
              {item.handledAt ? t('markPending') : t('markHandled')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.action, styles.actionDanger]}
            disabled={enCours === item.id}
            onPress={() => confirmerSuspension(item)}
          >
            {enCours === item.id ? (
              <ActivityIndicator size="small" color={themeColors.onContrast} />
            ) : (
              <Text style={[styles.actionTexte, styles.actionDangerTexte]}>
                {suspendu ? t('restore') : t('suspend')}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <BackButton onPress={navigation.goBack} style={styles.headerButton} />

        <Text style={styles.titre}>{t('reportsTitle')}</Text>

        <View style={styles.headerButton} />
      </View>

      <View style={styles.filtres}>
        {[true, false].map((enAttente) => (
          <TouchableOpacity
            key={String(enAttente)}
            style={[
              styles.filtre,
              enAttenteSeulement === enAttente ? styles.filtreActif : null,
            ]}
            onPress={() => {
              setChargement(true);
              setEnAttenteSeulement(enAttente);
            }}
          >
            <Text
              style={[
                styles.filtreTexte,
                enAttenteSeulement === enAttente
                  ? styles.filtreTexteActif
                  : null,
              ]}
            >
              {enAttente ? t('filterPending') : t('filterAll')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {chargement ? (
        <ActivityIndicator style={styles.loader} color={themeColors.primary} />
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(report) => report.id}
          renderItem={renderReport}
          contentContainerStyle={styles.liste}
          ListEmptyComponent={
            <View style={styles.vide}>
              <Text style={styles.videTitre}>{t('emptyTitle')}</Text>
              <Text style={styles.videTexte}>{t('emptyText')}</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.screen },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: c.surface,
    },
    headerButton: { width: 44 },
    titre: {
      flex: 1,
      textAlign: 'center',
      fontSize: 17,
      fontWeight: '700',
      color: c.text,
    },
    filtres: {
      flexDirection: 'row',
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: c.surface,
    },
    filtre: {
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.border,
    },
    filtreActif: { backgroundColor: c.contrast, borderColor: c.contrast },
    filtreTexte: { fontSize: 13, fontWeight: '600', color: c.text },
    filtreTexteActif: { color: c.onContrast },
    loader: { marginTop: 40 },
    liste: { padding: 16, gap: 12, flexGrow: 1 },
    carte: {
      padding: 14,
      borderRadius: 16,
      backgroundColor: c.surface,
    },
    // Un signalement traite reste consultable mais s'efface visuellement.
    carteTraitee: { opacity: 0.55 },
    entete: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: c.surfaceAlt,
    },
    avatarVide: { backgroundColor: c.border },
    identite: { flex: 1 },
    nom: { fontSize: 15, fontWeight: '700', color: c.text },
    email: { fontSize: 12, color: c.textMuted },
    etiquetteSuspendu: {
      fontSize: 11,
      fontWeight: '800',
      color: c.danger,
    },
    motif: {
      marginTop: 10,
      fontSize: 14,
      fontWeight: '600',
      color: c.text,
    },
    message: { marginTop: 4, fontSize: 13, color: c.textMuted },
    meta: { marginTop: 8, fontSize: 11, color: c.textMuted },
    actions: { flexDirection: 'row', gap: 8, marginTop: 12 },
    action: {
      flex: 1,
      height: 38,
      borderRadius: 19,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionTexte: { fontSize: 13, fontWeight: '700', color: c.text },
    actionDanger: { backgroundColor: c.contrast, borderColor: c.contrast },
    actionDangerTexte: { color: c.onContrast },
    vide: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 32,
    },
    videTitre: { fontSize: 16, fontWeight: '700', color: c.text },
    videTexte: {
      marginTop: 6,
      fontSize: 14,
      color: c.textMuted,
      textAlign: 'center',
    },
  });
