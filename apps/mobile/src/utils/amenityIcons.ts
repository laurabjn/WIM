import {
  AirVent,
  Binoculars,
  Car,
  Check,
  CircleParking,
  Dog,
  Dumbbell,
  Flame,
  Mountain,
  Palmtree,
  Trees,
  Umbrella,
  Waves,
  Wifi,
} from 'lucide-react-native';

type AmenityIconProps = {
  size?: number;
  color?: string;
};

export type AmenityIconComponent =
  React.ComponentType<AmenityIconProps>;

const AMENITY_ICON_RULES: Array<{
  keywords: string[];
  icon: AmenityIconComponent;
}> = [
  {
    keywords: ['wifi', 'internet'],
    icon: Wifi,
  },
  {
    keywords: ['plage'],
    icon: Umbrella,
  },
  {
    keywords: ['mer', 'océan', 'ocean', 'lac', 'piscine'],
    icon: Waves,
  },
  {
    keywords: ['terrasse'],
    icon: Palmtree,
  },
  {
    keywords: ['jardin'],
    icon: Trees,
  },
  {
    keywords: ['animaux', 'chien'],
    icon: Dog,
  },
  {
    keywords: ['parking'],
    icon: CircleParking,
  },
  {
    keywords: ['voiture', 'garage'],
    icon: Car,
  },
  {
    keywords: ['vue'],
    icon: Binoculars,
  },
  {
    keywords: ['sport', 'fitness'],
    icon: Dumbbell,
  },
  {
    keywords: ['climatisation'],
    icon: AirVent,
  },
  {
    keywords: ['cheminée', 'cheminee'],
    icon: Flame,
  },
  {
    keywords: ['montagne'],
    icon: Mountain,
  },
];

export function normalizeAmenity(
  amenity: string,
): string {
  return amenity
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function getAmenityIcon(
  amenity: string,
): AmenityIconComponent {
  const normalized =
    normalizeAmenity(amenity);

  const rule =
    AMENITY_ICON_RULES.find(rule =>
      rule.keywords.some(keyword =>
        normalized.includes(
          normalizeAmenity(keyword),
        ),
      ),
    );

  return rule?.icon ?? Check;
}