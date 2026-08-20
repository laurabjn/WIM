import {
  AirVent,
  Binoculars,
  Car,
  Check,
  CircleParking,
  CookingPot,
  Dog,
  Dumbbell,
  Flame,
  Laptop,
  Mountain,
  Palmtree,
  Trees,
  Tv,
  Umbrella,
  WashingMachine,
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
    keywords: ['plage', 'beach'],
    icon: Umbrella,
  },
  {
    keywords: ['mer', 'océan', 'ocean', 'lac', 'piscine', 'pool'],
    icon: Waves,
  },
  {
    keywords: ['terrasse', 'balcon', 'balcony', 'terrace'],
    icon: Palmtree,
  },
  {
    keywords: ['jardin', 'garden'],
    icon: Trees,
  },
  {
    keywords: ['animaux', 'chien', 'pets'],
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
    keywords: ['vue', 'view'],
    icon: Binoculars,
  },
  {
    keywords: ['sport', 'fitness', 'gym'],
    icon: Dumbbell,
  },
  {
    keywords: ['climatisation', 'airconditioning', 'clim'],
    icon: AirVent,
  },
  {
    keywords: ['cheminée', 'cheminee', 'fireplace'],
    icon: Flame,
  },
  {
    keywords: ['montagne', 'mountain'],
    icon: Mountain,
  },
  {
    keywords: ['cuisine', 'kitchen'],
    icon: CookingPot,
  },
  {
    keywords: ['tv', 'television', 'télévision'],
    icon: Tv,
  },
  {
    keywords: ['machine', 'washingmachine', 'lave-linge', 'laverie'],
    icon: WashingMachine,
  },
  {
    keywords: ['workspace', 'bureau', 'travail'],
    icon: Laptop,
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