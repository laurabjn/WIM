import {
  findOffensiveWords,
  isOffensive,
} from 'src/application/moderation/offensive-language';

describe('offensive-language', () => {
  it.each([
    "J'aurai un peu de retard à l'arrivée",
    'Merci de sortir les ordures le mardi',
    'Nous partons en Mongolie cet hiver',
    'Le studio est unique en son genre',
    'Monique arrive demain',
    'Bonjour, mon logement est libre en août',
  ])('laisse passer un message legitime : %s', (message) => {
    expect(isOffensive(message)).toBe(false);
  });

  it.each([
    'espèce de connard',
    'Tu es une salope',
    'ta gueule',
    'what the fuck',
    'fdp',
  ])('refuse une injure : %s', (message) => {
    expect(isOffensive(message)).toBe(true);
  });

  it('voit au travers des substitutions et des repetitions', () => {
    expect(isOffensive('c0nnard')).toBe(true);
    expect(isOffensive('CONNAAAARD !!!')).toBe(true);
    expect(isOffensive('s4lope')).toBe(true);
  });

  it('rend les mots trouves, sans doublon', () => {
    expect(findOffensiveWords('connard, sale connard')).toEqual(['connard']);
  });

  it('ne voit rien dans un message vide', () => {
    expect(findOffensiveWords('')).toEqual([]);
    expect(findOffensiveWords('   ')).toEqual([]);
  });
});
