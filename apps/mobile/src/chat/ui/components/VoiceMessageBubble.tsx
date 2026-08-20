import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Pause, Play } from 'lucide-react-native';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';

type Props = {
  uri: string;
  durationMs?: number | null;
  mine: boolean;
  /** Transcription faite sur l'appareil, traduite si la discussion l'est. */
  transcript?: string | null;
};

export function VoiceMessageBubble({
  uri,
  durationMs,
  mine,
  transcript,
}: Props) {
  const themeColors = useThemeColors();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);

  // Un objet source recree a chaque rendu ferait recharger le lecteur en
  // boucle : la lecture repartirait de zero des la premiere seconde ecoulee.
  const source = useMemo(() => ({ uri }), [uri]);

  const player = useAudioPlayer(source);
  const status = useAudioPlayerStatus(player);

  const teinte = mine ? themeColors.onBubbleMine : themeColors.onBubbleTheirs;

  // La duree enregistree a l'envoi s'affiche avant tout chargement ; celle du
  // lecteur prend le relais des qu'il connait le fichier.
  const totalSecondes =
    status.duration && status.duration > 0
      ? status.duration
      : (durationMs ?? 0) / 1000;

  const ecoulees = Math.min(status.currentTime, totalSecondes || Infinity);

  const progression =
    totalSecondes > 0 ? Math.min(1, Math.max(0, ecoulees / totalSecondes)) : 0;

  function basculer() {
    if (status.playing) {
      player.pause();
      return;
    }

    // Relancer un enregistrement arrive au bout ne bougerait pas : la tete de
    // lecture y est deja restee.
    if (
      status.didJustFinish ||
      (totalSecondes > 0 && status.currentTime >= totalSecondes - 0.05)
    ) {
      player.seekTo(0);
    }

    player.play();
  }

  const texte = transcript?.trim();

  return (
    <View>
      <View style={styles.rangee}>
        <TouchableOpacity
          onPress={basculer}
          activeOpacity={0.7}
          style={[styles.bouton, { borderColor: teinte }]}
        >
          {status.playing ? (
            <Pause size={15} color={teinte} fill={teinte} />
          ) : (
            <Play size={15} color={teinte} fill={teinte} />
          )}
        </TouchableOpacity>

        <View style={styles.piste}>
          <View style={[styles.pisteFond, { backgroundColor: teinte }]} />
          <View
            style={[
              styles.pisteRemplie,
              { backgroundColor: teinte, width: `${progression * 100}%` },
            ]}
          />
        </View>

        <Text style={[styles.duree, { color: teinte }]}>
          {formaterDuree(progression > 0 ? ecoulees : totalSecondes)}
        </Text>
      </View>

      {texte ? (
        <Text style={[styles.transcription, { color: teinte }]}>{texte}</Text>
      ) : null}
    </View>
  );
}

function formaterDuree(secondes: number) {
  if (!Number.isFinite(secondes) || secondes < 0) return '0:00';

  const entier = Math.floor(secondes);

  return `${Math.floor(entier / 60)}:${String(entier % 60).padStart(2, '0')}`;
}

const createStyles = (_c: ThemeColors) =>
  StyleSheet.create({
    rangee: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      minWidth: 168,
    },
    bouton: {
      width: 30,
      height: 30,
      borderRadius: 15,
      borderWidth: 1.4,
      alignItems: 'center',
      justifyContent: 'center',
    },
    piste: {
      flex: 1,
      height: 3,
      justifyContent: 'center',
    },
    pisteFond: {
      height: 3,
      borderRadius: 2,
      opacity: 0.3,
    },
    pisteRemplie: {
      position: 'absolute',
      height: 3,
      borderRadius: 2,
    },
    duree: {
      fontSize: 12,
      fontWeight: '600',
      fontVariant: ['tabular-nums'],
    },
    transcription: {
      marginTop: 8,
      fontSize: 14,
      lineHeight: 19,
      opacity: 0.85,
    },
  });
