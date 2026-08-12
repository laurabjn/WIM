const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const DEMO_DOMAIN = '@demo.worldismine.fr';
const DEMO_PASSWORD = 'DemoWim2026';

const photo = (id) => `https://images.unsplash.com/${id}?w=1200&q=80`;
const avatar = (n) => `https://i.pravatar.cc/300?img=${n}`;

const IMG = {
  salonLumineux: 'photo-1502672260266-1c1ef2d93688',
  salon: 'photo-1560448204-e02f11c3d0e2',
  canape: 'photo-1522708323590-d24dbb6b0267',
  salonCosy: 'photo-1586023492125-27b2c045efd7',
  interieur: 'photo-1600607687939-ce8a6c25118c',
  chambre: 'photo-1600566753086-00f18fb6b3ea',
  chambre2: 'photo-1571003123894-1f0594d2b5d9',
  chambre3: 'photo-1505873242700-f289a29e1e0f',
  sallePain: 'photo-1600210492486-724fe5c67fb0',
  cuisine: 'photo-1484154218962-a197022b5858',
  cuisine2: 'photo-1556909212-d5b604d0c90d',
  maison: 'photo-1512917774080-9991f1c4c750',
  maisonModerne: 'photo-1600585154340-be6161a56a0c',
  maison2: 'photo-1600596542815-ffad4c1539a9',
  maison3: 'photo-1502005229762-cf1b2da7c5d6',
  chaletBois: 'photo-1493809842364-78817add7ffb',
  chalet: 'photo-1416331108676-a22ccb276e35',
  chaletMontagne: 'photo-1449158743715-0a90ebb6d2d8',
  villaPiscine: 'photo-1613490493576-7fde63acd811',
  villa: 'photo-1512918728675-ed5a9ecdebfd',
  voitureCitadine: 'photo-1549317661-bd32c8ce0db2',
  voitureSuv: 'photo-1533473359331-0135ef1b58bf',
  voitureBreak: 'photo-1552519507-da3b142c6e3d',
};

const REVIEW_TEMPLATES = [
  {
    score: 5,
    comment:
      "Séjour parfait du début à la fin. Le logement correspond exactement aux photos, tout était impeccable et l'accueil très chaleureux. Nous reviendrons sans hésiter.",
  },
  {
    score: 4,
    comment:
      "Très bel endroit, spacieux et bien situé. Quelques bruits de rue le matin, mais rien de gênant. Les échanges avec les propriétaires ont été fluides.",
  },
  {
    score: 5,
    comment:
      'Un vrai coup de cœur. Le quartier est agréable, les commerces sont à deux pas et le logement est encore plus lumineux que sur les photos.',
  },
  {
    score: 4,
    comment:
      "L'échange s'est très bien passé. Logement propre, équipement complet, et des recommandations de restaurants qui valaient le détour.",
  },
  {
    score: 5,
    comment:
      'Nous avons passé deux semaines formidables. Tout était pensé pour se sentir chez soi, jusqu\'aux petits détails. Merci encore !',
  },
  {
    score: 3,
    comment:
      "Bon séjour dans l'ensemble. Le logement est conforme à la description, mais la connexion internet était capricieuse pendant notre séjour.",
  },
];

const CONVERSATIONS = [
  {
    between: ['sophie', 'thomas'],
    messages: [
      { from: 'thomas', content: 'Bonjour Sophie ! Votre appartement a Lyon me plait beaucoup. Seriez-vous interessee par un echange fin aout ?', daysAgo: 6 },
      { from: 'sophie', content: 'Bonjour Thomas, avec plaisir ! Bordeaux nous tente depuis longtemps. Vous seriez la sur quelles dates exactement ?', daysAgo: 6 },
      { from: 'thomas', content: 'Du 15 au 25 aout de preference. La maison est libre et le jardin est parfait si vous venez en famille.', daysAgo: 5 },
      { from: 'sophie', content: 'Ces dates nous conviennent. Je regarde les trains et je reviens vers vous rapidement.', daysAgo: 2 },
    ],
  },
  {
    between: ['sophie', 'elena'],
    messages: [
      { from: 'elena', content: 'Ciao Sophie ! Votre studio pres du Parc de la Tete d Or a l air parfait pour un sejour de travail.', daysAgo: 3 },
      { from: 'sophie', content: 'Merci Elena ! Il y a un vrai bureau et la fibre, c est ideal pour teletravailler. Florence me fait beaucoup envie de mon cote.', daysAgo: 3 },
      { from: 'elena', content: 'Alors on devrait pouvoir s entendre. Je vous envoie mes disponibilites de septembre ce week-end.', daysAgo: 1 },
    ],
  },
  {
    // Marc ecrit, Sophie ne repond pas : la conversation reste une demande.
    between: ['sophie', 'marc'],
    messages: [
      { from: 'marc', content: 'Bonjour Sophie, je serais interesse par un echange avec votre studio a Lyon en octobre. Mon chalet est libre a ces dates.', daysAgo: 2 },
    ],
  },
  {
    between: ['sophie', 'lucia'],
    messages: [
      { from: 'lucia', content: 'Bonjour Sophie ! Valence en novembre, cela vous dirait ? Ma maison est a dix minutes du centre historique.', daysAgo: 12 },
      { from: 'sophie', content: 'Avec grand plaisir Lucia, novembre me convient tres bien. Je bloque les dates de mon cote.', daysAgo: 11 },
      { from: 'lucia', content: 'Parfait, je valide. A tres vite !', daysAgo: 10 },
    ],
  },
  {
    between: ['marc', 'lucia'],
    messages: [
      { from: 'lucia', content: 'Bonjour Marc, votre chalet a Chamonix est magnifique. Est-il accessible en hiver sans equipement particulier ?', daysAgo: 9 },
      { from: 'marc', content: 'Bonjour Lucia ! La route est deneigee tous les matins, des pneus hiver suffisent largement.', daysAgo: 8 },
    ],
  },
];

const daysFromNow = (days) => {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
};

const OWNERS = [
  {
    key: 'sophie',
    memberSince: new Date('2019-04-08T00:00:00.000Z'),
    birthDate: new Date('1985-03-14T00:00:00.000Z'),
    email: `sophie${DEMO_DOMAIN}`,
    firstName: 'Sophie',
    lastName: 'Martin',
    avatar: avatar(5),
    country: 'France',
    nationality: 'française',
    bio: "Architecte à Lyon, je voyage dès que possible et j'adore accueillir.",
    languages: ['french', 'english'],
    rating: 5,
  },
  {
    key: 'thomas',
    memberSince: new Date('2021-09-16T00:00:00.000Z'),
    birthDate: new Date('1990-07-22T00:00:00.000Z'),
    email: `thomas${DEMO_DOMAIN}`,
    firstName: 'Thomas',
    lastName: 'Leroy',
    avatar: avatar(12),
    country: 'France',
    nationality: 'française',
    bio: 'Photographe basé à Bordeaux. Toujours partant pour un échange.',
    languages: ['french', 'english'],
    rating: 4,
  },
  {
    key: 'elena',
    memberSince: new Date('2018-06-02T00:00:00.000Z'),
    birthDate: new Date('1982-11-03T00:00:00.000Z'),
    email: `elena${DEMO_DOMAIN}`,
    firstName: 'Elena',
    lastName: 'Rossi',
    avatar: avatar(20),
    country: 'Italie',
    nationality: 'italienne',
    bio: 'Je vis à Florence avec mes deux chats. Échange de maison depuis 2019.',
    languages: ['english', 'french'],
    rating: 5,
  },
  {
    key: 'marc',
    memberSince: new Date('2020-11-23T00:00:00.000Z'),
    birthDate: new Date('1958-01-19T00:00:00.000Z'),
    email: `marc${DEMO_DOMAIN}`,
    firstName: 'Marc',
    lastName: 'Dubois',
    avatar: avatar(33),
    country: 'France',
    nationality: 'française',
    bio: 'Retraité, passionné de montagne et de randonnée.',
    languages: ['french'],
    rating: 4,
  },
  {
    key: 'lucia',
    memberSince: new Date('2022-02-11T00:00:00.000Z'),
    birthDate: new Date('1993-05-30T00:00:00.000Z'),
    email: `lucia${DEMO_DOMAIN}`,
    firstName: 'Lucia',
    lastName: 'Fernandez',
    avatar: avatar(47),
    country: 'Espagne',
    nationality: 'espagnole',
    bio: 'Prof de yoga à Valence, ma maison est ouverte toute l\'année.',
    languages: ['english'],
    rating: 5,
  },
  {
    key: 'hugo',
    memberSince: new Date('2023-02-11T00:00:00.000Z'),
    birthDate: new Date('1990-07-22T00:00:00.000Z'),
    email: `hugo${DEMO_DOMAIN}`,
    firstName: 'Hugo',
    lastName: 'Nardi',
    avatar: avatar(12),
    country: 'Portugal',
    nationality: 'portugaise',
    bio: "Developpeur a Porto, je cherche des sejours au calme pour ecrire.",
    languages: ['portuguese', 'french', 'english'],
    rating: 4,
  },
  {
    key: 'chloe',
    memberSince: new Date('2021-06-02T00:00:00.000Z'),
    birthDate: new Date('1980-05-10T00:00:00.000Z'),
    email: `chloe${DEMO_DOMAIN}`,
    firstName: 'Chloé',
    lastName: 'Berger',
    avatar: avatar(24),
    country: 'France',
    nationality: 'française',
    bio: "Illustratrice à Annecy, je pars souvent en montagne.",
    languages: ["french", "english"],
    rating: 5,
  },
  {
    key: 'karim',
    memberSince: new Date('2022-01-19T00:00:00.000Z'),
    birthDate: new Date('1981-05-11T00:00:00.000Z'),
    email: `karim${DEMO_DOMAIN}`,
    firstName: 'Karim',
    lastName: 'Haddad',
    avatar: avatar(33),
    country: 'Maroc',
    nationality: 'marocaine',
    bio: "Photographe à Marrakech, toujours partant pour un échange.",
    languages: ["french", "arabic", "english"],
    rating: 4,
  },
  {
    key: 'ines',
    memberSince: new Date('2020-09-30T00:00:00.000Z'),
    birthDate: new Date('1982-05-12T00:00:00.000Z'),
    email: `ines${DEMO_DOMAIN}`,
    firstName: 'Inès',
    lastName: 'Costa',
    avatar: avatar(47),
    country: 'Portugal',
    nationality: 'portugaise',
    bio: "Libraire à Lisbonne, amoureuse des vieilles pierres.",
    languages: ["portuguese", "french"],
    rating: 5,
  },
  {
    key: 'bruno',
    memberSince: new Date('2023-03-14T00:00:00.000Z'),
    birthDate: new Date('1983-05-13T00:00:00.000Z'),
    email: `bruno${DEMO_DOMAIN}`,
    firstName: 'Bruno',
    lastName: 'Keller',
    avatar: avatar(15),
    country: 'Suisse',
    nationality: 'suisse',
    bio: "Guide de montagne à Interlaken, je voyage hors saison.",
    languages: ["german", "french", "english"],
    rating: 4,
  },
  {
    key: 'mila',
    memberSince: new Date('2022-07-08T00:00:00.000Z'),
    birthDate: new Date('1984-05-14T00:00:00.000Z'),
    email: `mila${DEMO_DOMAIN}`,
    firstName: 'Mila',
    lastName: 'Novak',
    avatar: avatar(26),
    country: 'Croatie',
    nationality: 'croate',
    bio: "Prof de plongée à Split, ma maison est face à la mer.",
    languages: ["croatian", "english"],
    rating: 5,
  },
];

const HOMES = [
  {
    owner: 'sophie',
    title: 'Appartement lumineux en Presqu\'île',
    description:
      "Grand deux-pièces rénové au cœur de Lyon, à cinq minutes à pied de la place Bellecour. Parquet d'origine, cuisine équipée et balcon donnant sur une cour calme.",
    address: '12 rue de la République',
    city: 'Lyon',
    country: 'France',
    latitude: 45.7640,
    longitude: 4.8357,
    capacity: 4,
    beds: 2,
    bedrooms: 2,
    bathrooms: 1,
    homeType: 'APARTMENT',
    category: 'CITY',
    amenities: ['wifi', 'kitchen', 'tv', 'washingMachine', 'balcony', 'workspace'],
    pricePerNight: 95,
    averageRating: 4.8,
    reviewsCount: 24,
    carExchangeAccepted: true,
    photos: [IMG.salonLumineux, IMG.interieur, IMG.chambre, IMG.cuisine],
    vehicle: {
      brand: 'Renault',
      model: 'Zoe',
      seats: 5,
      type: 'city',
      fuelType: 'ELECTRIC',
      imageUrl: photo(IMG.voitureCitadine),
    },
    availabilities: [
      [10, 40],
      [60, 95],
    ],
  },
  {
    owner: 'thomas',
    title: 'Maison de ville avec jardin',
    description:
      'Maison bordelaise typique sur trois niveaux, avec un jardin clos de 80 m². Quartier des Chartrons, commerces et tramway à proximité immédiate.',
    address: '8 rue Notre-Dame',
    city: 'Bordeaux',
    country: 'France',
    latitude: 44.8515,
    longitude: -0.5726,
    capacity: 6,
    beds: 4,
    bedrooms: 3,
    bathrooms: 2,
    homeType: 'HOUSE',
    category: 'CITY',
    amenities: ['wifi', 'kitchen', 'parking', 'tv', 'washingMachine', 'workspace'],
    pricePerNight: 140,
    averageRating: 4.6,
    reviewsCount: 17,
    carExchangeAccepted: true,
    photos: [IMG.maison, IMG.salon, IMG.chambre2, IMG.cuisine2],
    vehicle: {
      brand: 'Peugeot',
      model: '3008',
      seats: 5,
      type: 'suv',
      fuelType: 'HYBRID',
      imageUrl: photo(IMG.voitureSuv),
    },
    availabilities: [
      [5, 30],
      [45, 75],
    ],
  },
  {
    owner: 'elena',
    title: 'Appartement vue Duomo',
    description:
      "Au dernier étage d'un palais du XVIe siècle, cet appartement offre une vue directe sur la coupole de Brunelleschi. Plafonds à fresques et mobilier d'époque.",
    address: 'Via dei Servi 34',
    city: 'Florence',
    country: 'Italie',
    latitude: 43.7731,
    longitude: 11.2560,
    capacity: 3,
    beds: 2,
    bedrooms: 1,
    bathrooms: 1,
    homeType: 'APARTMENT',
    category: 'CULTURE',
    amenities: ['wifi', 'kitchen', 'tv', 'airConditioning'],
    pricePerNight: 160,
    averageRating: 4.9,
    reviewsCount: 41,
    carExchangeAccepted: false,
    photos: [IMG.salonCosy, IMG.chambre3, IMG.sallePain, IMG.canape],
    availabilities: [
      [15, 50],
      [80, 120],
    ],
  },
  {
    owner: 'marc',
    title: 'Chalet au pied des pistes',
    description:
      'Chalet en mélèze entièrement rénové, à 200 mètres du télécabine. Poêle à bois, grande terrasse plein sud et vue sur le massif du Mont-Blanc.',
    address: '45 route des Praz',
    city: 'Chamonix',
    country: 'France',
    latitude: 45.9237,
    longitude: 6.8694,
    capacity: 8,
    beds: 5,
    bedrooms: 4,
    bathrooms: 2,
    homeType: 'HOUSE',
    category: 'NATURE',
    amenities: ['wifi', 'kitchen', 'parking', 'tv', 'washingMachine'],
    pricePerNight: 220,
    averageRating: 4.7,
    reviewsCount: 33,
    carExchangeAccepted: true,
    photos: [IMG.chaletBois, IMG.chalet, IMG.chaletMontagne, IMG.chambre],
    vehicle: {
      brand: 'Volkswagen',
      model: 'Tiguan',
      seats: 5,
      type: 'suv',
      fuelType: 'DIESEL',
      imageUrl: photo(IMG.voitureBreak),
    },
    availabilities: [
      [20, 60],
      [100, 140],
    ],
  },
  {
    owner: 'lucia',
    title: 'Maison avec patio andalou',
    description:
      "Maison traditionnelle organisée autour d'un patio planté d'orangers. À dix minutes du centre historique et à vingt minutes de la plage de la Malvarrosa.",
    address: 'Carrer de Sagunt 118',
    city: 'Valence',
    country: 'Espagne',
    latitude: 39.4813,
    longitude: -0.3765,
    capacity: 5,
    beds: 3,
    bedrooms: 3,
    bathrooms: 2,
    homeType: 'HOUSE',
    category: 'CULTURE',
    amenities: ['wifi', 'kitchen', 'airConditioning', 'washingMachine', 'balcony'],
    pricePerNight: 110,
    averageRating: 4.5,
    reviewsCount: 12,
    carExchangeAccepted: false,
    photos: [IMG.maison2, IMG.maison3, IMG.salon, IMG.cuisine],
    availabilities: [
      [1, 35],
      [50, 90],
    ],
  },
  {
    owner: 'sophie',
    title: 'Studio design près du Parc de la Tête d\'Or',
    description:
      'Studio de 32 m² entièrement repensé par un architecte, avec un lit escamotable et un vrai espace de travail. Idéal pour un séjour en solo ou en couple.',
    address: '3 rue Vauban',
    city: 'Lyon',
    country: 'France',
    latitude: 45.7700,
    longitude: 4.8500,
    capacity: 2,
    beds: 1,
    bedrooms: 1,
    bathrooms: 1,
    homeType: 'STUDIO',
    category: 'CITY',
    amenities: ['wifi', 'kitchen', 'tv', 'workspace'],
    pricePerNight: 65,
    averageRating: 4.4,
    reviewsCount: 9,
    carExchangeAccepted: false,
    photos: [IMG.canape, IMG.interieur, IMG.cuisine2],
    availabilities: [[8, 45]],
  },
  {
    owner: 'thomas',
    title: 'Villa avec piscine au Cap Ferret',
    description:
      "Villa en bois nichée dans les pins, à cinq minutes à pied de la plage. Piscine chauffée, grande terrasse et deux vélos à disposition.",
    address: '22 avenue de l\'Océan',
    city: 'Cap Ferret',
    country: 'France',
    latitude: 44.6333,
    longitude: -1.2500,
    capacity: 7,
    beds: 4,
    bedrooms: 4,
    bathrooms: 3,
    homeType: 'VILLA',
    category: 'BEACH',
    amenities: ['wifi', 'kitchen', 'parking', 'tv', 'washingMachine', 'balcony'],
    pricePerNight: 310,
    averageRating: 5.0,
    reviewsCount: 28,
    carExchangeAccepted: true,
    photos: [IMG.villaPiscine, IMG.villa, IMG.maisonModerne, IMG.salonCosy],
    availabilities: [
      [30, 70],
      [110, 150],
    ],
  },
  {
    owner: 'hugo',
    title: 'Maison de pecheur renovee',
    description:
      "Petite maison en pierre a deux rues de la plage, renovee avec soin. Patio ombrage, cuisine ouverte et velos a disposition pour longer le front de mer.",
    address: 'Rua das Redes 8',
    city: 'Porto',
    country: 'Portugal',
    latitude: 41.1496,
    longitude: -8.6109,
    capacity: 4,
    beds: 2,
    bedrooms: 2,
    bathrooms: 1,
    homeType: 'HOUSE',
    category: 'BEACH',
    amenities: ['wifi', 'kitchen', 'tv', 'washingMachine', 'balcony'],
    pricePerNight: 105,
    averageRating: 4.6,
    reviewsCount: 9,
    carExchangeAccepted: false,
    photos: [IMG.maison3, IMG.salonCosy, IMG.chambre3, IMG.cuisine2],
    availabilities: [
      [20, 60],
    ],
  },
  {
    owner: 'elena',
    title: 'Loft dans une ancienne fabrique',
    description:
      'Ancien atelier textile transformé en loft de 120 m², avec verrière et mezzanine. Quartier animé, à quinze minutes du centre à pied.',
    address: 'Via Pisana 210',
    city: 'Florence',
    country: 'Italie',
    latitude: 43.7700,
    longitude: 11.2200,
    capacity: 4,
    beds: 2,
    bedrooms: 2,
    bathrooms: 1,
    homeType: 'APARTMENT',
    category: 'CULTURE',
    amenities: ['wifi', 'kitchen', 'tv', 'airConditioning', 'workspace'],
    pricePerNight: 130,
    averageRating: 4.3,
    reviewsCount: 6,
    carExchangeAccepted: false,
    photos: [IMG.salonLumineux, IMG.chambre2, IMG.sallePain],
    availabilities: [[25, 65]],
  },  {
    owner: 'chloe',
    title: "Chalet face au lac d'Annecy",
    description:
      "Chalet en bois clair a cinq minutes du lac, avec un grand balcon plein sud. Depart de randonnees juste derriere la maison.",
    address: '3 chemin des Cretes',
    city: 'Annecy',
    country: 'France',
    latitude: 45.8992,
    longitude: 6.1294,
    capacity: 6,
    beds: 3,
    bedrooms: 3,
    bathrooms: 2,
    homeType: 'HOUSE',
    category: 'NATURE',
    amenities: ['wifi', 'kitchen', 'parking', 'tv', 'washingMachine'],
    pricePerNight: 120,
    averageRating: 4.7,
    reviewsCount: 11,
    carExchangeAccepted: true,
    photos: [IMG.chaletBois, IMG.chaletMontagne, IMG.salonCosy, IMG.chambre3],
    availabilities: [
      [10, 90],
    ],
  },
  {
    owner: 'karim',
    title: "Riad avec patio et fontaine",
    description:
      "Riad traditionnel au coeur de la medina, organise autour d'un patio frais. Terrasse sur le toit pour les soirees.",
    address: 'Derb Sidi Bouloukat 21',
    city: 'Marrakech',
    country: 'Maroc',
    latitude: 31.6295,
    longitude: -7.9811,
    capacity: 6,
    beds: 3,
    bedrooms: 3,
    bathrooms: 2,
    homeType: 'HOUSE',
    category: 'CULTURE',
    amenities: ['wifi', 'kitchen', 'airConditioning', 'tv'],
    pricePerNight: 95,
    averageRating: 4.9,
    reviewsCount: 17,
    carExchangeAccepted: false,
    photos: [IMG.maison2, IMG.salonLumineux, IMG.chambre2, IMG.cuisine],
    availabilities: [
      [10, 90],
    ],
  },
  {
    owner: 'ines',
    title: "Appartement azulejos a l'Alfama",
    description:
      "Deux-pieces renove dans le plus vieux quartier de Lisbonne, azulejos d'origine au mur. Tram a trente metres.",
    address: 'Rua dos Remedios 44',
    city: 'Lisbonne',
    country: 'Portugal',
    latitude: 38.7139,
    longitude: -9.1265,
    capacity: 3,
    beds: 2,
    bedrooms: 1,
    bathrooms: 1,
    homeType: 'APARTMENT',
    category: 'CULTURE',
    amenities: ['wifi', 'kitchen', 'tv', 'balcony'],
    pricePerNight: 85,
    averageRating: 4.5,
    reviewsCount: 14,
    carExchangeAccepted: false,
    photos: [IMG.salon, IMG.chambre, IMG.cuisine2],
    availabilities: [
      [10, 90],
    ],
  },
  {
    owner: 'bruno',
    title: "Refuge au pied de la Jungfrau",
    description:
      "Ancien refuge de berger entierement isole, vue directe sur les glaciers. Poele a bois et silence complet.",
    address: 'Alpenweg 7',
    city: 'Interlaken',
    country: 'Suisse',
    latitude: 46.6863,
    longitude: 7.8632,
    capacity: 4,
    beds: 2,
    bedrooms: 2,
    bathrooms: 1,
    homeType: 'HOUSE',
    category: 'NATURE',
    amenities: ['kitchen', 'parking', 'washingMachine'],
    pricePerNight: 140,
    averageRating: 4.8,
    reviewsCount: 8,
    carExchangeAccepted: true,
    photos: [IMG.chalet, IMG.chaletMontagne, IMG.interieur],
    availabilities: [
      [10, 90],
    ],
  },
  {
    owner: 'mila',
    title: "Maison de pierre face a l'Adriatique",
    description:
      "Maison en pierre blanche a dix metres de l'eau, terrasse ombragee par une vigne. Palmes et masques fournis.",
    address: 'Ulica Obala 12',
    city: 'Split',
    country: 'Croatie',
    latitude: 43.5081,
    longitude: 16.4402,
    capacity: 5,
    beds: 3,
    bedrooms: 2,
    bathrooms: 1,
    homeType: 'HOUSE',
    category: 'BEACH',
    amenities: ['wifi', 'kitchen', 'airConditioning', 'balcony', 'parking'],
    pricePerNight: 110,
    averageRating: 4.9,
    reviewsCount: 21,
    carExchangeAccepted: false,
    photos: [IMG.maison3, IMG.villa, IMG.salonCosy, IMG.chambre2],
    availabilities: [
      [10, 90],
    ],
  },

];

async function main() {
  console.log('[seed] Mots de passe : hachage en cours…');
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const ownersByKey = {};
  for (const owner of OWNERS) {
    const data = {
      firstName: owner.firstName,
      lastName: owner.lastName,
      avatarUrl: owner.avatar,
      bio: owner.bio,
      birthDate: owner.birthDate,
      country: owner.country,
      nationality: owner.nationality,
      languages: owner.languages,
      rating: owner.rating,
      preferredLocale: 'fr',
      identityStatus: 'VERIFIED',
      passwordHash,
    };

    ownersByKey[owner.key] = await prisma.user.upsert({
      where: { email: owner.email },
      update: { ...data, createdAt: owner.memberSince },
      create: { email: owner.email, ...data, createdAt: owner.memberSince },
    });
  }
  console.log(`[seed] ${OWNERS.length} comptes de démonstration prêts.`);

  const ownerIds = Object.values(ownersByKey).map((u) => u.id);
  const removed = await prisma.home.deleteMany({
    where: { ownerId: { in: ownerIds } },
  });
  if (removed.count > 0) {
    console.log(`[seed] ${removed.count} logements de démo précédents supprimés.`);
  }

  let totalReviews = 0;

  for (const [index, home] of HOMES.entries()) {
    const owner = ownersByKey[home.owner];

    const authors = OWNERS.filter((o) => o.key !== home.owner).map(
      (o) => ownersByKey[o.key],
    );

    const reviews = Array.from({ length: 2 + (index % 3) }, (_, i) => {
      const template = REVIEW_TEMPLATES[(index + i) % REVIEW_TEMPLATES.length];
      return {
        authorId: authors[i % authors.length].id,
        score: template.score,
        comment: template.comment,
        createdAt: daysFromNow(-(10 + i * 25)),
      };
    });

    const averageScore =
      reviews.reduce((sum, review) => sum + review.score, 0) / reviews.length;

    totalReviews += reviews.length;

    await prisma.home.create({
      data: {
        ownerId: owner.id,
        title: home.title,
        category: home.category,
        description: home.description,
        address: home.address,
        city: home.city,
        country: home.country,
        latitude: home.latitude,
        longitude: home.longitude,
        capacity: home.capacity,
        beds: home.beds,
        bedrooms: home.bedrooms,
        bathrooms: home.bathrooms,
        homeType: home.homeType,
        amenities: home.amenities,
        isAvailableForExchange: true,
        pricePerNight: home.pricePerNight,
        averageRating: Math.round(averageScore * 10) / 10,
        reviewsCount: reviews.length,
        carExchangeAccepted: home.carExchangeAccepted,

        photos: {
          create: home.photos.map((seed, index) => ({
            url: photo(seed),
            position: index,
          })),
        },

        availabilities: {
          create: home.availabilities.map(([from, to]) => ({
            startDate: daysFromNow(from),
            endDate: daysFromNow(to),
            type: 'AVAILABLE',
          })),
        },

        reviews: {
          create: reviews,
        },

        ...(home.vehicle ? { vehicle: { create: home.vehicle } } : {}),
      },
    });
  }

  const previousMatches = await prisma.match.findMany({
    where: {
      OR: [
        { user1Id: { in: ownerIds } },
        { user2Id: { in: ownerIds } },
      ],
    },
    select: { id: true },
  });

  const previousMatchIds = previousMatches.map((match) => match.id);

  await prisma.chat.deleteMany({
    where: { matchId: { in: previousMatchIds } },
  });

  await prisma.match.deleteMany({
    where: { id: { in: previousMatchIds } },
  });

  let totalMessages = 0;

  for (const conversation of CONVERSATIONS) {
    const [firstKey, secondKey] = conversation.between;
    const first = ownersByKey[firstKey];
    const second = ownersByKey[secondKey];

    const match = await prisma.match.create({
      data: {
        user1Id: first.id,
        user2Id: second.id,
        status: 'ACCEPTED',
        chat: {
          create: {
            participants: {
              create: [
                { userId: first.id },
                { userId: second.id },
              ],
            },
          },
        },
      },
      include: { chat: true },
    });

    for (const [index, message] of conversation.messages.entries()) {
      const sentAt = daysFromNow(-message.daysAgo);
      sentAt.setUTCHours(9, index * 7, 0, 0);

      await prisma.message.create({
        data: {
          chatId: match.chat.id,
          senderId: ownersByKey[message.from].id,
          content: message.content,
          createdAt: sentAt,
        },
      });
      totalMessages += 1;
    }
  }

  await prisma.swipe.deleteMany({
    where: {
      OR: [
        { swiperId: { in: ownerIds } },
        { targetUserId: { in: ownerIds } },
      ],
    },
  });

  const demoHomes = await prisma.home.findMany({
    where: { ownerId: { in: ownerIds } },
    select: { id: true, ownerId: true },
  });

  const firstHomeOf = new Map();

  for (const home of demoHomes) {
    if (!firstHomeOf.has(home.ownerId)) firstHomeOf.set(home.ownerId, home.id);
  }

  const sophie = ownersByKey.sophie;

  // Ceux-la ont deja like Sophie : quand elle swipe leur logement, le match part
  // aussitot. Bruno et Mila ne l'ont pas likee : leur carte se passe sans rien
  // declencher, pour que les deux issues soient testables.
  const ADMIRATEURS = ['chloe', 'karim', 'ines'];

  const sophieHomeId = firstHomeOf.get(sophie.id);

  for (const key of ADMIRATEURS) {
    const admirateur = ownersByKey[key];

    if (!admirateur || !sophieHomeId) continue;

    await prisma.swipe.create({
      data: {
        swiperId: admirateur.id,
        targetUserId: sophie.id,
        homeId: sophieHomeId,
        direction: 'LIKE',
      },
    });
  }

  console.log(
    `[seed] ${ADMIRATEURS.length} personnes ont deja like Sophie : swiper leur logement cree un match.`,
  );

  await prisma.exchange.deleteMany({
    where: {
      OR: [
        { hostId: { in: ownerIds } },
        { guestId: { in: ownerIds } },
      ],
    },
  });

  // Un etat par paire, pour que chaque cas de l'application soit visible depuis
  // le compte de Sophie. Un seul echange vivant par paire : c'est aussi la
  // regle que l'API applique.
  const PLANNED_EXCHANGES = [
    // En cours : commence il y a trois jours, se termine dans quatre.
    { host: 'thomas', guest: 'sophie', status: 'CURRENT', from: -3, to: 4 },
    // Termine il y a un mois : Sophie peut donc en proposer un nouveau.
    { host: 'elena', guest: 'sophie', status: 'PAST', from: -40, to: -30 },
    // En attente : le bandeau d'acceptation s'affiche pour les deux.
    { host: 'sophie', guest: 'marc', status: 'PENDING', from: 21, to: 31 },
    // Accepte, pas encore commence.
    { host: 'lucia', guest: 'sophie', status: 'FUTURE', from: 60, to: 70 },
  ];

  let createdExchanges = 0;

  for (const planned of PLANNED_EXCHANGES) {
    const host = ownersByKey[planned.host];
    const guest = ownersByKey[planned.guest];

    const hostHome = await prisma.home.findFirst({
      where: { ownerId: host.id },
      select: { id: true },
      orderBy: { createdAt: 'asc' },
    });

    if (!hostHome) continue;

    await prisma.exchange.create({
      data: {
        homeId: hostHome.id,
        hostId: host.id,
        guestId: guest.id,
        startDate: daysFromNow(planned.from),
        endDate: daysFromNow(planned.to),
        travelersCount: 2,
        status: planned.status,
      },
    });

    createdExchanges += 1;
  }

  console.log(
    `[seed] ${createdExchanges} echanges : un en cours, un passe, un en attente, un a venir.`,
  );

  // Un match que personne n'a ouvert : il appartient a Demandes > Matchs, et
  // n'apparait pas dans la liste des conversations.
  const hugo = ownersByKey.hugo;

  await prisma.match.create({
    data: {
      user1Id: [ownersByKey.sophie.id, hugo.id].sort()[0],
      user2Id: [ownersByKey.sophie.id, hugo.id].sort()[1],
      status: 'ACCEPTED',
      chat: {
        create: {
          participants: {
            create: [
              { userId: ownersByKey.sophie.id },
              { userId: hugo.id },
            ],
          },
        },
      },
    },
  });

  console.log('[seed] 1 match non ouvert : aucune conversation entamee.');

  // Sans marque de lecture, une conversation ou l'on a deja repondu affichait
  // quand meme ses anciens messages comme non lus. On considere donc que chacun
  // a lu jusqu'a son propre dernier message : ne restent non lus que ceux
  // arrives apres sa derniere reponse.
  const tousLesChats = await prisma.chat.findMany({
    where: { participants: { some: { userId: { in: ownerIds } } } },
    select: {
      id: true,
      participants: { select: { userId: true } },
    },
  });

  for (const chat of tousLesChats) {
    for (const participant of chat.participants) {
      const sien = await prisma.message.findFirst({
        where: { chatId: chat.id, senderId: participant.userId },
        orderBy: { createdAt: 'desc' },
        select: { id: true },
      });

      if (!sien) continue;

      await prisma.chatParticipant.updateMany({
        where: { chatId: chat.id, userId: participant.userId },
        data: { lastReadMessageId: sien.id },
      });
    }
  }

  // Thomas, lui, a tout lu : Sophie voit donc "Vu" sous son dernier message.
  const thomasChat = tousLesChats.find(
    (chat) =>
      chat.participants.some((p) => p.userId === ownersByKey.thomas.id) &&
      chat.participants.some((p) => p.userId === ownersByKey.sophie.id),
  );

  if (thomasChat) {
    const dernier = await prisma.message.findFirst({
      where: { chatId: thomasChat.id },
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    });

    if (dernier) {
      await prisma.chatParticipant.updateMany({
        where: { chatId: thomasChat.id, userId: ownersByKey.thomas.id },
        data: { lastReadMessageId: dernier.id },
      });
    }
  }

  console.log(
    `[seed] ${CONVERSATIONS.length} conversations creees, ${totalMessages} messages.`,
  );

  const totalPhotos = HOMES.reduce((sum, h) => sum + h.photos.length, 0);
  console.log(
    `[seed] ${HOMES.length} logements créés, ${totalPhotos} photos, ${totalReviews} avis.`,
  );
  console.log('');
  console.log('Comptes de démonstration (mot de passe commun) :');
  for (const owner of OWNERS) {
    console.log(`  ${owner.email}  /  ${DEMO_PASSWORD}`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('[seed] Terminé.');
  })
  .catch(async (e) => {
    console.error('[seed] Échec :', e);
    await prisma.$disconnect();
    process.exit(1);
  });
