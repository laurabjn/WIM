import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { getSession } from 'src/auth/infrastructure/authStorage';
import { reviewStayApi } from 'src/chat/infrastructure/exchange.api';
import { resolveImageUrl } from 'src/home/infrastructure/home.api';
import { BackButton } from 'src/shared/ui/BackButton';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';

const NOTES = [1, 2, 3, 4, 5];
const COMMENTAIRE_MIN = 10;
const COMMENTAIRE_MAX = 1000;

type Props = {
  route: {
    params: {
      exchangeId: string;
      homeTitle: string;
      homePhotoUrl?: string | null;
      partnerFirstName?: string;
    };
  };
  navigation: { goBack: () => void };
};

export function ReviewStayScreen({ route, navigation }: Props) {
  const { t } = useTranslation('exchange');
  const themeColors = useThemeColors();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);

  const { exchangeId, homeTitle, homePhotoUrl, partnerFirstName } =
    route.params;

  const [score, setScore] = useState(0);
  const [comment, setComment] = useState('');
  const [envoi, setEnvoi] = useState(false);

  const commentaire = comment.trim();
  const complet = score > 0 && commentaire.length >= COMMENTAIRE_MIN;

  async function envoyer() {
    if (!complet || envoi) return;

    setEnvoi(true);

    try {
      const session = await getSession();

      if (!session?.accessToken) return;

      await reviewStayApi(session.accessToken, exchangeId, score, commentaire);

      Alert.alert('', t('review.thanks'), [
        { text: t('review.ok'), onPress: navigation.goBack },
      ]);
    } catch (error) {
      Alert.alert(
        '',
        error instanceof Error ? error.message : t('review.error'),
      );
    } finally {
      setEnvoi(false);
    }
  }

  const photo = homePhotoUrl ? resolveImageUrl(homePhotoUrl) : null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <BackButton onPress={navigation.goBack} style={styles.headerButton} />

        <Text style={styles.headerTitle}>{t('review.title')}</Text>

        <View style={styles.headerButton} />
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        <ScrollView
          contentContainerStyle={styles.contenu}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logement}>
            {photo ? (
              <Image source={{ uri: photo }} style={styles.photo} />
            ) : (
              <View style={[styles.photo, styles.photoVide]} />
            )}

            <View style={styles.logementTexte}>
              <Text style={styles.logementTitre} numberOfLines={2}>
                {homeTitle}
              </Text>

              {partnerFirstName ? (
                <Text style={styles.logementHote}>
                  {t('review.hostedBy', { nom: partnerFirstName })}
                </Text>
              ) : null}
            </View>
          </View>

          <Text style={styles.question}>{t('review.scoreQuestion')}</Text>

          <View style={styles.etoiles}>
            {NOTES.map((valeur) => (
              <TouchableOpacity
                key={valeur}
                activeOpacity={0.7}
                onPress={() => setScore(valeur)}
                style={styles.etoileBouton}
              >
                <Text
                  style={[
                    styles.etoile,
                    valeur <= score ? styles.etoilePleine : null,
                  ]}
                >
                  {valeur <= score ? '★' : '☆'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.question}>{t('review.commentQuestion')}</Text>

          <TextInput
            style={styles.champ}
            value={comment}
            onChangeText={setComment}
            placeholder={t('review.commentPlaceholder')}
            placeholderTextColor={themeColors.textFaint}
            multiline
            maxLength={COMMENTAIRE_MAX}
            textAlignVertical="top"
          />

          <Text style={styles.compteur}>
            {commentaire.length < COMMENTAIRE_MIN
              ? t('review.minChars', {
                  count: COMMENTAIRE_MIN - commentaire.length,
                })
              : `${comment.length}/${COMMENTAIRE_MAX}`}
          </Text>

          <Text style={styles.rappel}>{t('review.mandatory')}</Text>

          <TouchableOpacity
            style={[styles.bouton, !complet ? styles.boutonInactif : null]}
            activeOpacity={0.85}
            disabled={!complet || envoi}
            onPress={envoyer}
          >
            {envoi ? (
              <ActivityIndicator color={themeColors.onContrast} />
            ) : (
              <Text style={styles.boutonTexte}>{t('review.submit')}</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.surface },
    flex: { flex: 1 },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    headerButton: { width: 44 },
    headerTitle: {
      flex: 1,
      textAlign: 'center',
      fontSize: 17,
      fontWeight: '700',
      color: c.text,
    },
    contenu: { padding: 20, paddingBottom: 40 },
    logement: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 12,
      borderRadius: 16,
      backgroundColor: c.surfaceAlt,
    },
    photo: {
      width: 64,
      height: 64,
      borderRadius: 12,
      backgroundColor: c.border,
    },
    photoVide: { backgroundColor: c.border },
    logementTexte: { flex: 1 },
    logementTitre: { fontSize: 15, fontWeight: '700', color: c.text },
    logementHote: { marginTop: 2, fontSize: 13, color: c.textMuted },
    question: {
      marginTop: 26,
      fontSize: 15,
      fontWeight: '700',
      color: c.text,
    },
    etoiles: { flexDirection: 'row', marginTop: 10 },
    etoileBouton: { paddingHorizontal: 6, paddingVertical: 4 },
    etoile: { fontSize: 34, color: c.border },
    etoilePleine: { color: '#F59E0B' },
    champ: {
      marginTop: 10,
      minHeight: 130,
      padding: 14,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.border,
      fontSize: 15,
      lineHeight: 21,
      color: c.text,
    },
    compteur: {
      marginTop: 6,
      textAlign: 'right',
      fontSize: 12,
      color: c.textMuted,
    },
    rappel: {
      marginTop: 20,
      fontSize: 13,
      lineHeight: 18,
      color: c.textMuted,
    },
    bouton: {
      marginTop: 20,
      height: 52,
      borderRadius: 26,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.contrast,
    },
    boutonInactif: { opacity: 0.4 },
    boutonTexte: { fontSize: 15, fontWeight: '700', color: c.onContrast },
  });
