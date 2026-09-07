export const NATIONALITY_OPTIONS = [
  'french',
  'belgian',
  'spanish',
  'italian',
  'german',
  'british',
  'american',
  'canadian',
] as const;

export const COUNTRY_OPTIONS = [
  'france',
  'belgium',
  'spain',
  'italy',
  'germany',
  'unitedKingdom',
  'unitedStates',
  'canada',
] as const;

export const COUNTRY_DIAL_CODES: Record<
  (typeof COUNTRY_OPTIONS)[number],
  { iso: string; dial: string }
> = {
  france: { iso: 'FR', dial: '+33' },
  belgium: { iso: 'BE', dial: '+32' },
  spain: { iso: 'ES', dial: '+34' },
  italy: { iso: 'IT', dial: '+39' },
  germany: { iso: 'DE', dial: '+49' },
  unitedKingdom: { iso: 'GB', dial: '+44' },
  unitedStates: { iso: 'US', dial: '+1' },
  canada: { iso: 'CA', dial: '+1' },
};

export function drapeauDepuisIso(iso: string): string {
  return iso
    .toUpperCase()
    .split('')
    .map((lettre) => String.fromCodePoint(127397 + lettre.charCodeAt(0)))
    .join('');
}

export function composerNumeroInternational(
  indicatif: string,
  numero: string,
): string {
  const chiffres = numero.replace(/\D/g, '').replace(/^0+/, '');

  return chiffres ? `${indicatif}${chiffres}` : '';
}

