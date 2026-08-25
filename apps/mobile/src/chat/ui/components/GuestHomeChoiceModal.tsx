import React, { useEffect, useMemo, useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import type { LogementCandidat } from 'src/chat/infrastructure/exchange.api';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';

type Props = {
  logements: LogementCandidat[];
  titre?: string;
  aide?: string;
  libelleValidation?: string;
  onFermer: () => void;
  onConfirmer: (logementId: string) => Promise<void>;
};

export const GuestHomeChoiceModal: React.FC<Props> = ({
  logements,
  titre,
  aide,
  libelleValidation,
  onFermer,
  onConfirmer,
}) => {
  const { t } = useTranslation(['exchange']);
  const themeColors = useThemeColors();
  const styles = useMemo(() => creerStyles(themeColors), [themeColors]);

  const [choisi, setChoisi] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    setChoisi(logements[0]?.id ?? null);
  }, [logements]);

  async function confirmer() {
    if (!choisi || envoi) return;

    setEnvoi(true);

    try {
      await onConfirmer(choisi);
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <Modal
      visible={logements.length > 0}
      transparent
      animationType="fade"
      onRequestClose={onFermer}
    >
      <Pressable style={styles.fond} onPress={onFermer} />

      <View style={styles.centre} pointerEvents="box-none">
        <View style={styles.carte}>
          <Text style={styles.titre}>
            {titre ?? t('exchange:chooseHomeTitle')}
          </Text>
          <Text style={styles.aide}>
            {aide ?? t('exchange:chooseHomeHint')}
          </Text>

          <ScrollView style={styles.liste}>
            {logements.map((logement) => {
              const actif = choisi === logement.id;

              return (
                <TouchableOpacity
                  key={logement.id}
                  style={[styles.ligne, actif && styles.ligneActive]}
                  onPress={() => setChoisi(logement.id)}
                  activeOpacity={0.8}
                >
                  {logement.imageUrl ? (
                    <Image
                      source={{ uri: logement.imageUrl }}
                      style={styles.vignette}
                    />
                  ) : (
                    <View style={[styles.vignette, styles.vignetteVide]} />
                  )}

                  <Text style={styles.titreLogement} numberOfLines={2}>
                    {logement.title}
                  </Text>

                  <View style={[styles.puce, actif && styles.puceActive]} />
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <TouchableOpacity
            style={[styles.valider, envoi && styles.validerInactif]}
            onPress={confirmer}
            disabled={envoi || !choisi}
          >
            <Text style={styles.validerTexte}>
              {libelleValidation ?? t('exchange:chooseHomeConfirm')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const creerStyles = (c: ThemeColors) =>
  StyleSheet.create({
    fond: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
    centre: { flex: 1, justifyContent: 'center', padding: 24 },
    carte: {
      backgroundColor: c.surface,
      borderRadius: 20,
      padding: 20,
      gap: 12,
      maxHeight: '80%',
    },
    titre: { fontSize: 18, fontWeight: '700', color: c.text },
    aide: { fontSize: 14, lineHeight: 20, color: c.textMuted },
    liste: { marginVertical: 4 },
    ligne: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 10,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.border,
      marginBottom: 8,
    },
    ligneActive: { borderColor: c.contrast, backgroundColor: c.surfaceAlt },
    vignette: { width: 54, height: 54, borderRadius: 10 },
    vignetteVide: { backgroundColor: c.surfaceAlt },
    titreLogement: { flex: 1, fontSize: 14, color: c.text },
    puce: {
      width: 18,
      height: 18,
      borderRadius: 9,
      borderWidth: 2,
      borderColor: c.border,
    },
    puceActive: { borderColor: c.contrast, backgroundColor: c.contrast },
    valider: {
      backgroundColor: c.contrast,
      borderRadius: 999,
      paddingVertical: 15,
      alignItems: 'center',
    },
    validerInactif: { opacity: 0.6 },
    validerTexte: { color: c.onContrast, fontSize: 15, fontWeight: '600' },
  });
