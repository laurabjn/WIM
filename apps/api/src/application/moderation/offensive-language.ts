/**
 * Detection d'injures dans un message.
 *
 * Un filtre par liste reste grossier : il ne comprend ni le ton ni le
 * contexte. On l'accepte parce que le cout d'un faux negatif — une insulte qui
 * passe — est bien moindre que celui d'un service tiers a qui l'on enverrait
 * toutes les conversations privees.
 *
 * Le prix a payer est le faux positif, et il se paie cher : un message
 * legitime refuse est bien plus penible qu'une grossierete qui passe. D'ou une
 * liste volontairement etroite, limitee aux insultes visant une personne et
 * aux injures racistes ou homophobes. En sont ecartes :
 *
 *  - "retard", qui veut dire delai ("j'aurai du retard") ;
 *  - "ordure", qui designe les poubelles ("sortir les ordures") ;
 *  - "mongol", qui designe aussi une nationalite ;
 *  - "putain", interjection courante qui ne vise personne ;
 *  - les insultes tiedes (debile, cretin, abruti), sans gravite ;
 *  - les sigles trop courts (pd, tg), trop faciles a rencontrer par hasard.
 */

// Formes de base, sans accent ni ponctuation : la normalisation s'en charge.
const INJURES = [
  // Francais
  'connard', 'connasse', 'salope', 'salopard', 'encule', 'enculer',
  'enfoire', 'batard', 'pute', 'tapette', 'negre', 'bougnoule', 'youpin',
  'crevure', 'raclure', 'nique', 'niquer', 'ntm', 'fdp',
  'ta gueule', 'ferme ta gueule',
  // Anglais
  'fuck', 'fucking', 'fucker', 'motherfucker', 'bitch', 'asshole',
  'bastard', 'cunt', 'faggot', 'nigger', 'whore', 'slut', 'dickhead',
  'wanker',
];

// Chiffres et symboles employes a la place des lettres : sans cela, "c0nnard"
// passerait sans encombre.
const SUBSTITUTIONS: Record<string, string> = {
  '0': 'o',
  '1': 'i',
  '3': 'e',
  '4': 'a',
  '5': 's',
  '7': 't',
  '@': 'a',
  '$': 's',
};

function normaliser(texte: string): string {
  const sansAccent = texte
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  const substitue = sansAccent.replace(
    /[013457@$]/g,
    (caractere) => SUBSTITUTIONS[caractere] ?? caractere,
  );

  return (
    substitue
      // Lettres repetees pour contourner la liste : "connaaaard".
      .replace(/(.)\1{2,}/g, '$1')
      // Tout le reste devient separateur : on peut ainsi exiger des mots
      // entiers sans se battre avec la ponctuation.
      .replace(/[^a-z ]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  );
}

/** Rend les injures trouvees, sans doublon. */
export function findOffensiveWords(texte: string): string[] {
  if (!texte?.trim()) return [];

  const normalise = ` ${normaliser(texte)} `;

  const trouvees = INJURES.filter((injure) => normalise.includes(` ${injure} `));

  return [...new Set(trouvees)];
}

export function isOffensive(texte: string): boolean {
  return findOffensiveWords(texte).length > 0;
}
