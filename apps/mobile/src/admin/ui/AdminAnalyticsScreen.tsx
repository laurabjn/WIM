import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { getSession } from 'src/auth/infrastructure/authStorage';
import { BackButton } from 'src/shared/ui/BackButton';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';
import {
  getAnalyticsApi,
  type AnalyseAdmin,
} from '../infrastructure/adminExtras.api';

type Props = {
  navigation: { goBack: () => void };
};

export const AdminAnalyticsScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation(['admin']);
  const themeColors = useThemeColors();
  const styles = useMemo(() => creerStyles(themeColors), [themeColors]);

  const [analyse, setAnalyse] = useState<AnalyseAdmin | null>(null);

  useEffect(() => {
    async function charger() {
      try {
        const session = await getSession();

        if (!session?.accessToken) return;

        setAnalyse(await getAnalyticsApi(session.accessToken));
      } catch (error) {
        console.log('Load analytics error:', error);
      }
    }

    charger();
  }, []);

  function Section({
    titre,
    lignes,
  }: {
    titre: string;
    lignes: { libelle: string; valeur: number | string }[];
  }) {
    return (
      <View style={styles.carte}>
        <Text style={styles.sectionTitre}>{titre}</Text>

        {lignes.map((ligne) => (
          <View key={ligne.libelle} style={styles.ligne}>
            <Text style={styles.libelle}>{ligne.libelle}</Text>
            <Text style={styles.valeur}>{ligne.valeur}</Text>
          </View>
        ))}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.entete}>
        <BackButton onPress={navigation.goBack} style={styles.rond} />
        <Text style={styles.titre}>{t('admin:analyticsTitle')}</Text>
        <View style={styles.rond} />
      </View>

      {!analyse ? (
        <ActivityIndicator style={styles.chargement} color={themeColors.text} />
      ) : (
        <ScrollView contentContainerStyle={styles.contenu}>
          <Section
            titre={t('admin:analytics.signups')}
            lignes={[
              {
                libelle: t('admin:analytics.last7'),
                valeur: analyse.inscriptions.septJours,
              },
              {
                libelle: t('admin:analytics.last30'),
                valeur: analyse.inscriptions.trenteJours,
              },
              {
                libelle: t('admin:analytics.total'),
                valeur: analyse.inscriptions.total,
              },
            ]}
          />

          <Section
            titre={t('admin:analytics.activity')}
            lignes={[
              {
                libelle: t('admin:analytics.active7'),
                valeur: analyse.activite.actifsSeptJours,
              },
              {
                libelle: t('admin:analytics.neverReturned'),
                valeur: analyse.activite.jamaisRevenus,
              },
            ]}
          />

          <Section
            titre={t('admin:analytics.verification')}
            lignes={Object.entries(analyse.verification).map(
              ([statut, nombre]) => ({
                libelle: t(`admin:identity.${statut}`, statut),
                valeur: nombre,
              }),
            )}
          />

          <Section
            titre={t('admin:analytics.homes')}
            lignes={[
              {
                libelle: t('admin:analytics.total'),
                valeur: analyse.logements.total,
              },
              {
                libelle: t('admin:analytics.open'),
                valeur: analyse.logements.ouverts,
              },
              {
                libelle: t('admin:analytics.withoutPhoto'),
                valeur: analyse.logements.sansPhoto,
              },
            ]}
          />

          <Section
            titre={t('admin:analytics.exchanges')}
            lignes={Object.entries(analyse.echanges).map(
              ([statut, nombre]) => ({
                libelle: t(`admin:exchangeStatus.${statut}`, statut),
                valeur: nombre,
              }),
            )}
          />

          <Section
            titre={t('admin:analytics.conversations')}
            lignes={[
              {
                libelle: t('admin:analytics.total'),
                valeur: analyse.conversations.total,
              },
              {
                libelle: t('admin:analytics.neverStarted'),
                valeur: analyse.conversations.sansReponse,
              },
            ]}
          />

          {analyse.villesRecherchees.length > 0 ? (
            <Section
              titre={t('admin:analytics.topCities')}
              lignes={analyse.villesRecherchees.map((ville) => ({
                libelle: ville.ville,
                valeur: ville.recherches,
              }))}
            />
          ) : null}
        </ScrollView>
      )}
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
    contenu: { padding: 12, gap: 10, paddingBottom: 120 },
    carte: {
      backgroundColor: c.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.border,
      padding: 14,
      gap: 6,
    },
    sectionTitre: {
      fontSize: 13,
      fontWeight: '800',
      color: c.text,
      marginBottom: 4,
    },
    ligne: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    libelle: { flex: 1, fontSize: 13, color: c.textMuted },
    valeur: { fontSize: 15, fontWeight: '700', color: c.text },
  });
