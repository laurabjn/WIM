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
  type LucideIcon,
} from 'lucide-react';

const REGLES: Array<{ mots: string[]; icone: LucideIcon }> = [
  { mots: ['wifi', 'internet'], icone: Wifi },
  { mots: ['plage', 'beach'], icone: Umbrella },
  { mots: ['mer', 'océan', 'ocean', 'lac', 'piscine', 'pool'], icone: Waves },
  { mots: ['terrasse', 'balcon', 'balcony', 'terrace'], icone: Palmtree },
  { mots: ['jardin', 'garden'], icone: Trees },
  { mots: ['animaux', 'chien', 'pets'], icone: Dog },
  { mots: ['parking'], icone: CircleParking },
  { mots: ['voiture', 'garage'], icone: Car },
  { mots: ['vue', 'view'], icone: Binoculars },
  { mots: ['sport', 'fitness', 'gym'], icone: Dumbbell },
  { mots: ['climatisation', 'airconditioning', 'clim'], icone: AirVent },
  { mots: ['cheminée', 'cheminee', 'fireplace'], icone: Flame },
  { mots: ['montagne', 'mountain'], icone: Mountain },
  { mots: ['cuisine', 'kitchen'], icone: CookingPot },
  { mots: ['tv', 'television', 'télévision'], icone: Tv },
  {
    mots: ['machine', 'washingmachine', 'lave-linge', 'laverie'],
    icone: WashingMachine,
  },
  { mots: ['workspace', 'bureau', 'travail'], icone: Laptop },
];

function normaliser(equipement: string) {
  return equipement
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

export function iconeEquipement(equipement: string): LucideIcon {
  const normalise = normaliser(equipement);

  const regle = REGLES.find((candidate) =>
    candidate.mots.some((mot) => normalise.includes(normaliser(mot))),
  );

  return regle?.icone ?? Check;
}
