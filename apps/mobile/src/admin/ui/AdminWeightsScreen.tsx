import React, { useEffect, useMemo, useState } from 'react';
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
import { useTranslation } from 'react-i18next';

import { getSession } from 'src/auth/infrastructure/authStorage';
import { BackButton } from 'src/shared/ui/BackButton';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';
import {
  getWeightsApi,
  setWeightsApi,
  type PoidsRecommandation,
} from '../infrastructure/adminExtras.api';

type Props = {
  navigation: { goBack: () => void };
};

const PAS = 1;

export const AdminWeightsScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation(['admin', 'common']);
  const themeColors = useThemeColors();
  const styles = useMemo(() => creerStyles(themeColors), [themeColors]);

  const [poids, setPoids] = useState<PoidsRecommandation | null>(null);
  const [initial, setInitial] = useState<PoidsRecommandation | null>(null);
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    async function charger() {
      try {
        const session = await getSession();

        if (!session?.accessToken) return;

        const valeurs = await getWeightsApi(session.accessToken);

        setPoids(valeurs);
        setInitial(valeurs);
      } catch (error) {
        console.log('Load weights error:', error);
      }
    }

    charger();
  }, []);

  function ajuster(cle: string, pas: number) {
    setPoids((actuels) =>
      actuels
        ? { ...actuels, [cle]: Math.max(0, Math.min(100, actuels[cle] + pas)) }
        : actuels,
    );
  }

  async function enregistrer() {
    if (!poids || envoi) return;

    setEnvoi(true);

    try {
      const session = await getSession();

      if (!session?.accessToken) return;

      const enregistres = await setWeightsApi(session.accessToken, poids);

      setPoids(enregistres);
      setInitial(enregistres);

      Alert.alert('', t('admin:weightsSaved'));
    } catch (error: any) {
      Alert.alert('', error?.message ?? t('admin:actionError'));
    } finally {
      setEnvoi(false);
    }
  }

  const modifie =
    poids !== null &&
    initial !== null &&
    Object.keys(poids).some((cle) => poids[cle] !== initial[cle]);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.entete}>
        <BackButton onPress={navigation.goBack} style={styles.rond} />
        <Text style={styles.titre}>{t('admin:weightsTitle')}</Text>
        <View style={styles.rond} />
      </View>

      {!poids ? (
        <ActivityIndicator style={styles.chargement} color={themeColors.text} />
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.contenu}>
            <Text style={styles.aide}>{t('admin:weightsHint')}</Text>

            {Object.keys(poids).map((cle) => (
              <View key={cle} style={styles.ligne}>
                <Text style={styles.libelle}>
                  {t(`admin:weights.${cle}`, cle)}
                </Text>

                <View style={styles.compteur}>
                  <TouchableOpacity
                    style={styles.rondBouton}
                    onPress={() => ajuster(cle, -PAS)}
                  >
                    <Text style={styles.rondTexte}>-</Text>
                  </TouchableOpacity>

                  <Text style={styles.valeur}>{poids[cle]}</Text>

                  <TouchableOpacity
                    style={styles.rondBouton}
                    onPress={() => ajuster(cle, PAS)}
                  >
                    <Text style={styles.rondTexte}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={[styles.valider, (!modifie || envoi) && styles.inactif]}
            disabled={!modifie || envoi}
            onPress={enregistrer}
          >
            <Text style={styles.validerTexte}>{t('common:save')}</Text>
          </TouchableOpacity>
        </>
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
    contenu: { padding: 12, paddingBottom: 120, gap: 8 },
    aide: {
      fontSize: 13,
      lineHeight: 19,
      color: c.textMuted,
      marginBottom: 8,
    },
    ligne: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: c.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.border,
      paddingHorizontal: 14,
      paddingVertical: 10,
      gap: 12,
    },
    libelle: { flex: 1, fontSize: 13, color: c.text },
    compteur: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    rondBouton: {
      width: 30,
      height: 30,
      borderRadius: 15,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rondTexte: { fontSize: 16, color: c.text },
    valeur: { minWidth: 30, textAlign: 'center', color: c.text },
    valider: {
      margin: 16,
      backgroundColor: c.contrast,
      borderRadius: 999,
      paddingVertical: 15,
      alignItems: 'center',
    },
    inactif: { opacity: 0.5 },
    validerTexte: { color: c.onContrast, fontWeight: '700' },
  });
