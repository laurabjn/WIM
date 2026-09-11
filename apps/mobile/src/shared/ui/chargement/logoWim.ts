export const HAUTEUR = 100;

export const COULEURS = {
  turquoise: '#3BBFAF',
  encre: '#2A2A2A',
  gris: '#8C8C8C',
} as const;

export type Forme = { d: string; couleur: string };

export type Groupe = {
  nom: string;
  capitale: boolean;
  largeur: number;
  formes?: Forme[];
  texte?: string;
};

export const ESPACE_MOT = 4;
export const ESPACE_MONOGRAMME = -10;

export const GROUPES: Groupe[] = [
  {
    nom: 'W',
    capitale: true,
    largeur: 70,
    formes: [
      { d: 'M0 4 H26 L44 96 H18 Z', couleur: COULEURS.turquoise },
      { d: 'M36 4 H70 L70 96 H52 Z', couleur: COULEURS.encre },
    ],
  },
  { nom: 'orld', capitale: false, largeur: 150, texte: 'orld' },
  {
    nom: 'I',
    capitale: true,
    largeur: 22,
    formes: [{ d: 'M0 4 H22 V96 H0 Z', couleur: COULEURS.turquoise }],
  },
  { nom: 's', capitale: false, largeur: 42, texte: 's' },
  {
    nom: 'M',
    capitale: true,
    largeur: 70,
    formes: [
      { d: 'M0 96 V4 H26 L44 60 L26 96 Z', couleur: COULEURS.encre },
      { d: 'M36 96 L52 4 H70 V96 Z', couleur: COULEURS.turquoise },
    ],
  },
  { nom: 'ine', capitale: false, largeur: 110, texte: 'ine' },
];
