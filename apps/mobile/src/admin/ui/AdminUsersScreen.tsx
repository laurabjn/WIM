import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { getSession } from 'src/auth/infrastructure/authStorage';
import { BackButton } from 'src/shared/ui/BackButton';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';
import { setUserSuspensionApi } from '../infrastructure/admin.api';
import {
  searchUsersApi,
  setIdentityStatusApi,
  type CompteAdmin,
} from '../infrastructure/adminExtras.api';

type Props = {
  navigation: { goBack: () => void };
};

export const AdminUsersScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation(['admin', 'common']);
  const themeColors = useThemeColors();
  const styles = useMemo(() => creerStyles(themeColors), [themeColors]);

  const [recherche, setRecherche] = useState('');
  const [comptes, setComptes] = useState<CompteAdmin[]>([]);
  const [chargement, setChargement] = useState(true);

  const charger = useCallback(async (terme: string) => {
    try {
      const session = await getSession();

      if (!session?.accessToken) return;

      setComptes(await searchUsersApi(session.accessToken, terme));
    } catch (error) {
      console.log('Search users error:', error);
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    const minuteur = setTimeout(() => charger(recherche), 350);

    return () => clearTimeout(minuteur);
  }, [recherche, charger]);

  async function reglerLIdentite(
    compte: CompteAdmin,
    statut: 'VERIFIED' | 'REFUSED',
  ) {
    try {
      const session = await getSession();

      if (!session?.accessToken) return;

      await setIdentityStatusApi(session.accessToken, compte.id, statut);

      await charger(recherche);
    } catch (error: any) {
      Alert.alert('', error?.message ?? t('admin:actionError'));
    }
  }

  async function basculerSuspension(compte: CompteAdmin) {
    const suspendre = !compte.suspendedAt;
    const nom = compte.firstName ?? compte.email;

    Alert.alert(
      suspendre ? t('admin:suspendTitle') : t('admin:restoreTitle'),
      suspendre
        ? t('admin:suspendConfirm', { nom })
        : t('admin:restoreConfirm', { nom }),
      [
        { text: t('common:cancel'), style: 'cancel' },
        {
          text: suspendre ? t('admin:suspend') : t('admin:restore'),
          style: suspendre ? 'destructive' : 'default',
          onPress: async () => {
            try {
              const session = await getSession();

              if (!session?.accessToken) return;

              await setUserSuspensionApi(
                session.accessToken,
                compte.id,
                suspendre,
              );

              await charger(recherche);
            } catch (error: any) {
              Alert.alert('', error?.message ?? t('admin:actionError'));
            }
          },
        },
      ],
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.entete}>
        <BackButton onPress={navigation.goBack} style={styles.rond} />
        <Text style={styles.titre}>{t('admin:usersTitle')}</Text>
        <View style={styles.rond} />
      </View>

      <TextInput
        value={recherche}
        onChangeText={setRecherche}
        placeholder={t('admin:searchPlaceholder')}
        placeholderTextColor={themeColors.textFaint}
        autoCapitalize="none"
        style={styles.champ}
      />

      {chargement ? (
        <ActivityIndicator style={styles.chargement} color={themeColors.text} />
      ) : (
        <FlatList
          data={comptes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.liste}
          ListEmptyComponent={
            <Text style={styles.vide}>{t('admin:noUser')}</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.carte}>
              <View style={styles.ligne}>
                <Text style={styles.nom} numberOfLines={1}>
                  {[item.firstName, item.lastName].filter(Boolean).join(' ') ||
                    item.email}
                </Text>

                {item.isAdmin ? (
                  <Text style={styles.etiquetteAdmin}>{t('admin:admin')}</Text>
                ) : null}

                {item.suspendedAt ? (
                  <Text style={styles.etiquetteSuspendu}>
                    {t('admin:suspended')}
                  </Text>
                ) : null}
              </View>

              <Text style={styles.courriel} numberOfLines={1}>
                {item.email}
              </Text>

              <Text style={styles.details}>
                {t('admin:homesCount', { count: item.logements })} ·{' '}
                {t('admin:reportsCount', { count: item.signalements })} ·{' '}
                {t(`admin:identity.${item.identityStatus}`, item.identityStatus)}
              </Text>

              <View style={styles.identite}>
                {(['VERIFIED', 'REFUSED'] as const)
                  .filter((statut) => statut !== item.identityStatus)
                  .map((statut) => (
                    <TouchableOpacity
                      key={statut}
                      style={styles.identiteBouton}
                      onPress={() => reglerLIdentite(item, statut)}
                    >
                      <Text style={styles.identiteTexte}>
                        {t(`admin:setIdentity.${statut}`)}
                      </Text>
                    </TouchableOpacity>
                  ))}
              </View>

              {item.isAdmin ? null : (
                <TouchableOpacity
                  style={[
                    styles.action,
                    item.suspendedAt && styles.actionRestaurer,
                  ]}
                  onPress={() => basculerSuspension(item)}
                >
                  <Text style={styles.actionTexte}>
                    {item.suspendedAt ? t('admin:restore') : t('admin:suspend')}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        />
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
    champ: {
      margin: 12,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      color: c.text,
      backgroundColor: c.surface,
    },
    chargement: { marginTop: 30 },
    liste: { paddingHorizontal: 12, paddingBottom: 120, gap: 10 },
    vide: { textAlign: 'center', color: c.textMuted, marginTop: 40 },
    carte: {
      backgroundColor: c.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.border,
      padding: 14,
      gap: 4,
    },
    ligne: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    nom: { flex: 1, fontSize: 15, fontWeight: '700', color: c.text },
    etiquetteAdmin: {
      fontSize: 11,
      fontWeight: '700',
      color: c.primary,
    },
    etiquetteSuspendu: {
      fontSize: 11,
      fontWeight: '700',
      color: c.danger,
    },
    courriel: { fontSize: 13, color: c.textMuted },
    details: { fontSize: 12, color: c.textFaint },
    identite: { flexDirection: 'row', gap: 8, marginTop: 8 },
    identiteBouton: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: c.border,
      paddingHorizontal: 12,
      paddingVertical: 7,
    },
    identiteTexte: { fontSize: 12, color: c.text },
    action: {
      marginTop: 8,
      alignSelf: 'flex-start',
      borderRadius: 999,
      paddingHorizontal: 16,
      paddingVertical: 9,
      backgroundColor: c.danger,
    },
    actionRestaurer: { backgroundColor: c.contrast },
    actionTexte: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  });
