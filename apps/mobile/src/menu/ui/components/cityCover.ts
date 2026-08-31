const UNSPLASH = 'https://images.unsplash.com/photo-';

// L'affiche annonce un lieu, pas un logement : montrer un salon a la place
// d'une ville ne dit rien de la destination.
const PAYSAGES: Record<string, string> = {
  lyon: `${UNSPLASH}1524397057410-1e775ed476f3`,
  paris: `${UNSPLASH}1502602898657-3e91760cbb34`,
  nantes: `${UNSPLASH}1590247813693-5541d1c609fd`,
  marseille: `${UNSPLASH}1544967082-d9d25d867d66`,
  bordeaux: `${UNSPLASH}1589656312481-c0dcd9e7ab26`,
  lisbonne: `${UNSPLASH}1585208798174-6cedd86e019a`,
  lisbon: `${UNSPLASH}1585208798174-6cedd86e019a`,
  porto: `${UNSPLASH}1555881400-74d7acaacd8b`,
  barcelone: `${UNSPLASH}1583422409516-2895a77efded`,
  barcelona: `${UNSPLASH}1583422409516-2895a77efded`,
  rome: `${UNSPLASH}1552832230-c0197dd311b5`,
  florence: `${UNSPLASH}1543429776-2782fc8e1acd`,
  gand: `${UNSPLASH}1559113202-c916b8e44373`,
  amsterdam: `${UNSPLASH}1534351590666-13e3e96b5017`,
  berlin: `${UNSPLASH}1560969184-10fe8719e047`,
  marrakech: `${UNSPLASH}1597212720158-c9b1f4ba9ba9`,
};

// Une ville inconnue vaut mieux qu'une piece a vivre : ce repli reste un
// paysage.
const PAR_DEFAUT = `${UNSPLASH}1501594907352-04cda38ebc29`;

const PARAMETRES = '?auto=format&fit=crop&w=1200&q=80';

export function couvertureDeVille(ville?: string | null): string {
  const cle = (ville ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

  return `${PAYSAGES[cle] ?? PAR_DEFAUT}${PARAMETRES}`;
}
