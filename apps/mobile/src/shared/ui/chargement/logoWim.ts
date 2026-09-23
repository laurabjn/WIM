export const HAUTEUR = 100;

export const COULEURS = {
  vert: '#52D1A6',
  bleu: '#2DA7F3',
  encre: '#2A2A2A',
} as const;

export type Peinture = string | { haut: string; bas: string };

export type Forme = {
  d: string;
  peinture: Peinture;
  arrondi?: number;
  disparait?: boolean;
};

export type Groupe = {
  nom: string;
  largeur: number;
  xMonogramme?: number;
  plan?: number;
  formes?: Forme[];
  texte?: string;
  couleur?: string;
};

export const ESPACE_MOT = 6;

const BARRE = 22;
const PENTE = 24;
const RAYON = 3;

function barre(x0: number): string {
  const haut = RAYON;
  const bas = HAUTEUR - RAYON;
  const decalage = (PENTE * (bas - haut)) / HAUTEUR;
  const gauche = x0 + RAYON;
  const droite = x0 + BARRE - RAYON;

  return `M${gauche} ${haut} H${droite} L${droite + decalage} ${bas} H${gauche + decalage} Z`;
}

const VERT_VERS_BLEU = { haut: COULEURS.vert, bas: COULEURS.bleu };
const BLEU_VERS_VERT = { haut: COULEURS.bleu, bas: COULEURS.vert };

export const GROUPES: Groupe[] = [
  {
    nom: 'W',
    largeur: 92,
    xMonogramme: 0,
    formes: [
      { d: 'M46 34 L40 100 H72 Z', peinture: COULEURS.bleu },
      { d: barre(0), peinture: VERT_VERS_BLEU, arrondi: RAYON },
      { d: barre(46), peinture: COULEURS.encre, arrondi: RAYON, disparait: true },
    ],
  },
  { nom: 'orld', largeur: 150, texte: 'orld', couleur: COULEURS.encre },
  {
    nom: 'I',
    largeur: 46,
    xMonogramme: 46,
    plan: 1,
    formes: [{ d: barre(0), peinture: COULEURS.vert, arrondi: RAYON }],
  },
  { nom: 's', largeur: 42, texte: 's', couleur: COULEURS.encre },
  {
    nom: 'M',
    largeur: 92,
    xMonogramme: 46,
    formes: [
      { d: 'M20 0 H48 L46 67 Z', peinture: COULEURS.bleu },
      { d: barre(0), peinture: COULEURS.encre, arrondi: RAYON, disparait: true },
      { d: barre(46), peinture: BLEU_VERS_VERT, arrondi: RAYON },
    ],
  },
  { nom: 'ine', largeur: 110, texte: 'ine', couleur: COULEURS.encre },
];
