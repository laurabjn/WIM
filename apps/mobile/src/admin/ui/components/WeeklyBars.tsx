import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';

type Props = {
  titre: string;
  valeurs: { semaine: string; valeur: number }[];
  couleur: string;
};

const HAUTEUR = 90;
const ESPACE = 4;

export const WeeklyBars: React.FC<Props> = ({ titre, valeurs, couleur }) => {
  const themeColors = useThemeColors();
  const styles = useMemo(() => creerStyles(themeColors), [themeColors]);

  const maximum = Math.max(1, ...valeurs.map((point) => point.valeur));
  const largeurBarre = 100 / Math.max(valeurs.length, 1);

  return (
    <View style={styles.carte}>
      <View style={styles.entete}>
        <Text style={styles.titre}>{titre}</Text>
        <Text style={styles.total}>
          {valeurs.reduce((somme, point) => somme + point.valeur, 0)}
        </Text>
      </View>

      {valeurs.length === 0 ? (
        <Text style={styles.vide}>—</Text>
      ) : (
        <>
          <Svg height={HAUTEUR} width="100%" viewBox="0 0 100 100">
            {valeurs.map((point, index) => {
              const hauteur = Math.max(2, (point.valeur / maximum) * 96);

              return (
                <Rect
                  key={point.semaine}
                  x={index * largeurBarre + ESPACE / 2}
                  y={100 - hauteur}
                  width={largeurBarre - ESPACE}
                  height={hauteur}
                  rx={1.5}
                  fill={couleur}
                  opacity={point.valeur === 0 ? 0.25 : 1}
                />
              );
            })}
          </Svg>

          <View style={styles.legende}>
            <Text style={styles.borne}>{formatSemaine(valeurs[0].semaine)}</Text>
            <Text style={styles.borne}>
              {formatSemaine(valeurs[valeurs.length - 1].semaine)}
            </Text>
          </View>
        </>
      )}
    </View>
  );
};

function formatSemaine(valeur: string) {
  return new Date(valeur).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
  });
}

const creerStyles = (c: ThemeColors) =>
  StyleSheet.create({
    carte: {
      backgroundColor: c.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.border,
      padding: 14,
      gap: 8,
    },
    entete: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'space-between',
    },
    titre: { fontSize: 13, fontWeight: '800', color: c.text },
    total: { fontSize: 16, fontWeight: '800', color: c.text },
    vide: { fontSize: 13, color: c.textFaint, textAlign: 'center' },
    legende: { flexDirection: 'row', justifyContent: 'space-between' },
    borne: { fontSize: 11, color: c.textFaint },
  });
