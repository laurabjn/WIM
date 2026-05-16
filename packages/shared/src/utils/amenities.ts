export const AMENITIES = [
    'kitchen',
    'garage',
    'garden',
    'pets',
    'wifi',
    'pool'
] as const;

export type Amenity = typeof AMENITIES[number];