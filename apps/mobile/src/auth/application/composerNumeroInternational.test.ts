import { composerNumeroInternational } from '@wim/shared/utils/locationOptions';

describe('composerNumeroInternational', () => {
  it('retire le zero initial des numeros nationaux', () => {
    expect(composerNumeroInternational('+33', '0612345678')).toBe(
      '+33612345678',
    );
  });

  it('accepte un numero deja sans zero', () => {
    expect(composerNumeroInternational('+33', '612345678')).toBe(
      '+33612345678',
    );
  });

  it('ignore les espaces et les separateurs de saisie', () => {
    expect(composerNumeroInternational('+32', '0 470 12 34 56')).toBe(
      '+32470123456',
    );
  });

  it('ne renvoie rien quand le numero est vide', () => {
    expect(composerNumeroInternational('+33', '')).toBe('');
    expect(composerNumeroInternational('+33', '00')).toBe('');
  });

  it('respecte l indicatif choisi', () => {
    expect(composerNumeroInternational('+1', '4165551234')).toBe(
      '+14165551234',
    );
  });
});
