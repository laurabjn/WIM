const countryCodes: Record<string, string> = {
  'États-Unis': 'US',
  'Etats-Unis': 'US',
  France: 'FR',
  Espagne: 'ES',
  Italie: 'IT',
  Japon: 'JP',
  Canada: 'CA',
  Allemagne: 'DE',
};

export function getCountryFlag(country: string) {
  const code = countryCodes[country];

  if (!code) {
    return '🌍';
  }

  return code
    .toUpperCase()
    .replace(/./g, (char) =>
      String.fromCodePoint(
        127397 + char.charCodeAt(0),
      ),
    );
}