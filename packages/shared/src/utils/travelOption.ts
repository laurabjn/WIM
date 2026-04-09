export const CONTINENTS = [
  'northAmerica',
  'southAmerica',
  'europe',
  'africa',
  'asia',
  'oceania',
] as const;

export const HOME_TYPES = [
  'apartment',
  'house',
  'all'
] as const;

export const SEASONS = [
  'spring',
  'summer',
  'autumn',
  'winter'
] as const;

export const ESSENTIAL_AMENITIES = [
  'wifi', 
  'parking',
  'kitchen',
  'tv',
  'airConditioning',
  'washingMachine',
  'balcony', 
  'workspace'
] as const;

export const ENVIRONMENTS = [
  'country',
  'city',
  'seaside',
  'entertainment',
  'relax'
] as const;

export const STAY_DURATIONS = [
  '1w',
  '2w',
  '3w',
  '1m',
  '2m',
  '3m'
] as const;

export type StayDuration = typeof STAY_DURATIONS[number];