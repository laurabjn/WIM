import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { clearSession, getSession } from 'src/auth/infrastructure/authStorage';
import { unregisterPushToken } from 'src/notifications/pushRegistration';
import {
  getAdminStatsApi,
  runReviewRemindersApi,
  type AdminStats,
} from '../infrastructure/admin.api';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';

type Props = {
  navigation: { navigate: (screen: string) => void };
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
};

export function AdminDashboardScreen({
  navigation,
  setIsAuthenticated,
}: Props) {
  const { t } = useTranslation('admin');
  const themeColors = useThemeColors();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [chargement, setChargement] = useState(true);
  const [rafraichit, setRafraichit] = useState(false);
  const [rappelsEnCours, setRappelsEnCours] = useState(false);

  const charger = useCallback(async () => {
    try {
      const session = await getSession();

      if (!session?.accessToken) return;

      setStats(await getAdminStatsApi(session.accessToken));
    } catch (error) {
      console.log('Load admin stats error:', error);
      Alert.alert('', t('loadError'));
    } finally {
      setChargement(false);
      setRafraichit(false);
    }
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      charger();
    }, [charger]),
  );

  async function lancerLesRappels() {
    setRappelsEnCours(true);

    try {
      const session = await getSession();

      if (!session?.accessToken) return;

      const bilan = await runReviewRemindersApi(session.accessToken);

      Alert.alert(
        '',
        t('remindersDone', {
          envoyes: bilan.envoyes,
          termines: bilan.termines,
        }),
      );

      await charger();
    } catch (error) {
      console.log('Run reminders error:', error);
      Alert.alert('', t('actionError'));
    } finally {
      setRappelsEnCours(false);
    }
  }

  async function seDeconnecter() {
    try {
      await unregisterPushToken();
      await clearSession();
    } catch (error) {
      console.log('Admin logout error:', error);
    } finally {
      setIsAuthenticated(false);
    }
  }

  const aTraiter = [
    {
      cle: 'pending',
      valeur: stats?.signalementsEnAttente ?? 0,
      libelle: t('statPendingReports'),
      alerte: (stats?.signalementsEnAttente ?? 0) > 0,
    },
    {
      cle: 'suspended',
      valeur: stats?.comptesSuspendus ?? 0,
      libelle: t('statSuspended'),
      alerte: false,
    },
  ];

  const volume = [
    { cle: 'users', valeur: stats?.utilisateurs ?? 0, libelle: t('statUsers') },
    {
      cle: 'new',
      valeur: stats?.nouveauxUtilisateurs ?? 0,
      libelle: t('statNewUsers'),
    },
    { cle: 'homes', valeur: stats?.logements ?? 0, libelle: t('statHomes') },
    {
      cle: 'current',
      valeur: stats?.echangesEnCours ?? 0,
      libelle: t('statCurrentExchanges'),
    },
    {
      cle: 'pendingEx',
      valeur: stats?.echangesEnAttente ?? 0,
      libelle: t('statPendingExchanges'),
    },
    {
      cle: 'messages',
      valeur: stats?.messages ?? 0,
      libelle: t('statMessages'),
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.contenu}
        refreshControl={
          <RefreshControl
            refreshing={rafraichit}
            onRefresh={() => {
              setRafraichit(true);
              charger();
            }}
          />
        }
      >
        <Text style={styles.titre}>{t('dashboardTitle')}</Text>
        <Text style={styles.sousTitre}>{t('dashboardSubtitle')}</Text>

        {chargement ? (
          <ActivityIndicator
            style={styles.loader}
            color={themeColors.primary}
          />
        ) : (
          <>
            <View style={styles.grille}>
              {aTraiter.map((carte) => (
                <View
                  key={carte.cle}
                  style={[styles.carte, carte.alerte ? styles.carteAlerte : null]}
                >
                  <Text
                    style={[
                      styles.valeur,
                      carte.alerte ? styles.valeurAlerte : null,
                    ]}
                  >
                    {carte.valeur}
                  </Text>
                  <Text style={styles.libelle}>{carte.libelle}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.bouton}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('AdminReports')}
            >
              <Text style={styles.boutonTexte}>{t('openReports')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.bouton, styles.boutonSecondaire]}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('AdminUsers')}
            >
              <Text style={styles.boutonSecondaireTexte}>
                {t('openUsers')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.bouton, styles.boutonSecondaire]}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('AdminWeights')}
            >
              <Text style={styles.boutonSecondaireTexte}>
                {t('openWeights')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.bouton, styles.boutonSecondaire]}
              activeOpacity={0.85}
              disabled={rappelsEnCours}
              onPress={lancerLesRappels}
            >
              {rappelsEnCours ? (
                <ActivityIndicator color={themeColors.text} />
              ) : (
                <Text style={styles.boutonSecondaireTexte}>
                  {t('runReminders')}
                </Text>
              )}
            </TouchableOpacity>

            <Text style={styles.section}>{t('sectionVolume')}</Text>

            <View style={styles.grille}>
              {volume.map((carte) => (
                <View key={carte.cle} style={styles.carte}>
                  <Text style={styles.valeur}>{carte.valeur}</Text>
                  <Text style={styles.libelle}>{carte.libelle}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        <TouchableOpacity
          style={styles.deconnexion}
          activeOpacity={0.7}
          onPress={seDeconnecter}
        >
          <Text style={styles.deconnexionTexte}>{t('logout')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.screen },
    contenu: { padding: 20, paddingBottom: 40 },
    titre: { fontSize: 24, fontWeight: '800', color: c.text },
    sousTitre: { marginTop: 4, fontSize: 14, color: c.textMuted },
    loader: { marginTop: 40 },
    grille: {
      marginTop: 18,
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    carte: {
      flexGrow: 1,
      flexBasis: '45%',
      padding: 16,
      borderRadius: 16,
      backgroundColor: c.surface,
    },
    carteAlerte: {
      borderWidth: 1,
      borderColor: c.danger,
    },
    valeur: { fontSize: 26, fontWeight: '800', color: c.text },
    valeurAlerte: { color: c.danger },
    libelle: { marginTop: 2, fontSize: 12, color: c.textMuted },
    bouton: {
      marginTop: 18,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.contrast,
    },
    boutonTexte: { fontSize: 15, fontWeight: '700', color: c.onContrast },
    boutonSecondaire: {
      marginTop: 10,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
    },
    boutonSecondaireTexte: {
      fontSize: 15,
      fontWeight: '700',
      color: c.text,
    },
    section: {
      marginTop: 28,
      fontSize: 13,
      fontWeight: '800',
      letterSpacing: 0.4,
      textTransform: 'uppercase',
      color: c.textMuted,
    },
    deconnexion: {
      marginTop: 32,
      alignItems: 'center',
      paddingVertical: 12,
    },
    deconnexionTexte: { fontSize: 14, fontWeight: '700', color: c.danger },
  });
