import { useWindowDimensions } from 'react-native';

export const LARGEUR_CONTENU_MAX = 520;

export const MARGE_DE_PAGE = 12;

export const ESPACE_SOUS_LA_BARRE_DETAT = 6;

export const RETRAIT_BAS_IOS = 14;

export function useDimensionsEcran() {
  const { width, height } = useWindowDimensions();

  return {
    largeur: width,
    hauteur: height,
    contenu: Math.min(width, LARGEUR_CONTENU_MAX),
  };
}
