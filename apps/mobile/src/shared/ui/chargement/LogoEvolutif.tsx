import React, { useEffect, useMemo, useRef } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import {
  COULEURS,
  ESPACE_MONOGRAMME,
  ESPACE_MOT,
  GROUPES,
  HAUTEUR,
} from './logoWim';

type Props = {
  depart: 'monogramme' | 'mot';
  onFin?: () => void;
};

const PART_DE_LARGEUR = 0.72;
const ECHELLE_MAX = 1;

const ATTENTE_MS = 500;
const TRANSITION_MS = 900;
const TENUE_MS = 600;

function disposer(largeurDisponible: number) {
  const largeurMot =
    GROUPES.reduce((total, groupe) => total + groupe.largeur, 0) +
    ESPACE_MOT * (GROUPES.length - 1);

  const echelle = Math.min(largeurDisponible / largeurMot, ECHELLE_MAX);

  let curseur = 0;
  const dansLeMot = GROUPES.map((groupe) => {
    const position = curseur;
    curseur += groupe.largeur + ESPACE_MOT;
    return position;
  });

  const capitales = GROUPES.filter((groupe) => groupe.capitale);
  const largeurMonogramme =
    capitales.reduce((total, groupe) => total + groupe.largeur, 0) +
    ESPACE_MONOGRAMME * (capitales.length - 1);

  let curseurMonogramme = (largeurMot - largeurMonogramme) / 2;
  const dansLeMonogramme = new Map<string, number>();
  for (const groupe of capitales) {
    dansLeMonogramme.set(groupe.nom, curseurMonogramme);
    curseurMonogramme += groupe.largeur + ESPACE_MONOGRAMME;
  }

  return { largeurMot, echelle, dansLeMot, dansLeMonogramme };
}

export function LogoEvolutif({ depart, onFin }: Props) {
  const { width } = useWindowDimensions();
  const { largeurMot, echelle, dansLeMot, dansLeMonogramme } = useMemo(
    () => disposer(width * PART_DE_LARGEUR),
    [width],
  );

  const ouverture = useRef(
    new Animated.Value(depart === 'monogramme' ? 0 : 1),
  ).current;

  const finRef = useRef(onFin);
  finRef.current = onFin;

  useEffect(() => {
    const cible = depart === 'monogramme' ? 1 : 0;
    let arrete = false;

    AccessibilityInfo.isReduceMotionEnabled().then((reduit) => {
      if (arrete) return;

      const mouvement = reduit
        ? Animated.timing(ouverture, {
            toValue: cible,
            duration: 0,
            useNativeDriver: true,
          })
        : Animated.timing(ouverture, {
            toValue: cible,
            duration: TRANSITION_MS,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          });

      Animated.sequence([
        Animated.delay(ATTENTE_MS),
        mouvement,
        Animated.delay(TENUE_MS),
      ]).start(({ finished }) => {
        if (finished && !arrete) finRef.current?.();
      });
    });

    return () => {
      arrete = true;
    };
  }, [depart, ouverture]);

  const hauteur = HAUTEUR * echelle;

  return (
    <View style={{ width: largeurMot * echelle, height: hauteur }}>
      {GROUPES.map((groupe, index) => {
        const largeur = groupe.largeur * echelle;
        const positionMot = dansLeMot[index] * echelle;

        if (groupe.capitale) {
          const positionMonogramme =
            (dansLeMonogramme.get(groupe.nom) ?? 0) * echelle;

          return (
            <Animated.View
              key={groupe.nom}
              style={[
                styles.groupe,
                {
                  width: largeur,
                  height: hauteur,
                  transform: [
                    {
                      translateX: ouverture.interpolate({
                        inputRange: [0, 1],
                        outputRange: [positionMonogramme, positionMot],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Svg
                width={largeur}
                height={hauteur}
                viewBox={`0 0 ${groupe.largeur} ${HAUTEUR}`}
              >
                {groupe.formes?.map((forme, i) => (
                  <Path key={i} d={forme.d} fill={forme.couleur} />
                ))}
              </Svg>
            </Animated.View>
          );
        }

        return (
          <Animated.View
            key={groupe.nom}
            style={[
              styles.groupe,
              styles.minuscules,
              {
                width: largeur,
                height: hauteur,
                left: positionMot,
                opacity: ouverture.interpolate({
                  inputRange: [0, 0.55, 1],
                  outputRange: [0, 0, 1],
                }),
              },
            ]}
          >
            <Text
              numberOfLines={1}
              style={[
                styles.texte,
                { fontSize: hauteur * 1.05, lineHeight: hauteur },
              ]}
            >
              {groupe.texte}
            </Text>
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  groupe: { position: 'absolute', top: 0, left: 0 },
  minuscules: { justifyContent: 'flex-end' },
  texte: {
    fontWeight: '900',
    color: COULEURS.encre,
    includeFontPadding: false,
  },
});
