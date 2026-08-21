const INJURES = [
  'connard', 'connasse', 'salope', 'salopard', 'encule', 'enculer',
  'enfoire', 'batard', 'pute', 'tapette', 'negre', 'bougnoule', 'youpin',
  'crevure', 'raclure', 'nique', 'niquer', 'ntm', 'fdp',
  'ta gueule', 'ferme ta gueule',
  'fuck', 'fucking', 'fucker', 'motherfucker', 'bitch', 'asshole',
  'bastard', 'cunt', 'faggot', 'nigger', 'whore', 'slut', 'dickhead',
  'wanker',
];

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
      .replace(/(.)\1{2,}/g, '$1')
      .replace(/[^a-z ]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  );
}

export function findOffensiveWords(texte: string): string[] {
  if (!texte?.trim()) return [];

  const normalise = ` ${normaliser(texte)} `;

  const trouvees = INJURES.filter((injure) => normalise.includes(` ${injure} `));

  return [...new Set(trouvees)];
}

export function isOffensive(texte: string): boolean {
  return findOffensiveWords(texte).length > 0;
}
