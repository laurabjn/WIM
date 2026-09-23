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
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { ESPACE_MOT, GROUPES, HAUTEUR, type Forme, type Groupe } from './logoWim';

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

  const largeurMonogramme = GROUPES.reduce(
    (max, groupe) =>
      groupe.xMonogramme === undefined
        ? max
        : Math.max(max, groupe.xMonogramme + groupe.largeur),
    0,
  );

  const origineMonogramme = (largeurMot - largeurMonogramme) / 2;

  return { largeurMot, echelle, dansLeMot, origineMonogramme };
}

function identifiant(groupe: Groupe, index: number) {
  return `degrade-${groupe.nom}-${index}`;
}

function Formes({
  groupe,
  formes,
  largeur,
  hauteur,
}: {
  groupe: Groupe;
  formes: Forme[];
  largeur: number;
  hauteur: number;
}) {
  return (
    <Svg width={largeur} height={hauteur} viewBox={`0 0 ${groupe.largeur} ${HAUTEUR}`}>
      <Defs>
        {formes.map((forme, index) =>
          typeof forme.peinture === 'string' ? null : (
            <LinearGradient
              key={index}
              id={identifiant(groupe, index)}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <Stop offset="0" stopColor={forme.peinture.haut} />
              <Stop offset="1" stopColor={forme.peinture.bas} />
            </LinearGradient>
          ),
        )}
      </Defs>

      {formes.map((forme, index) => {
        const peinture =
          typeof forme.peinture === 'string'
            ? forme.peinture
            : `url(#${identifiant(groupe, index)})`;

        return (
          <Path
            key={index}
            d={forme.d}
            fill={peinture}
            stroke={forme.arrondi ? peinture : undefined}
            strokeWidth={forme.arrondi ? forme.arrondi * 2 : undefined}
            strokeLinejoin="round"
          />
        );
      })}
    </Svg>
  );
}

export function LogoEvolutif({ depart, onFin }: Props) {
  const { width } = useWindowDimensions();
  const { largeurMot, echelle, dansLeMot, origineMonogramme } = useMemo(
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

      const mouvement = Animated.timing(ouverture, {
        toValue: cible,
        duration: reduit ? 0 : TRANSITION_MS,
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

        if (groupe.xMonogramme !== undefined) {
          const positionMonogramme =
            (origineMonogramme + groupe.xMonogramme) * echelle;

          const permanentes = (groupe.formes ?? []).filter(
            (forme) => !forme.disparait,
          );
          const passageres = (groupe.formes ?? []).filter(
            (forme) => forme.disparait,
          );

          return (
            <Animated.View
              key={groupe.nom}
              style={[
                styles.groupe,
                {
                  width: largeur,
                  height: hauteur,
                  zIndex: groupe.plan ?? 0,
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
              <Formes
                groupe={groupe}
                formes={permanentes}
                largeur={largeur}
                hauteur={hauteur}
              />

              {passageres.length > 0 ? (
                <Animated.View
                  style={[StyleSheet.absoluteFill, { opacity: ouverture }]}
                >
                  <Formes
                    groupe={groupe}
                    formes={passageres}
                    largeur={largeur}
                    hauteur={hauteur}
                  />
                </Animated.View>
              ) : null}
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
              adjustsFontSizeToFit
              minimumFontScale={0.4}
              style={[
                styles.texte,
                {
                  fontSize: hauteur,
                  lineHeight: hauteur,
                  color: groupe.couleur,
                },
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
    includeFontPadding: false,
  },
});
