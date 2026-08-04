/**
 * Jeu de données de démonstration.
 *
 * Écrit en JavaScript et non en TypeScript à dessein : l'image de production
 * n'embarque pas `ts-node` (dépendances de dev exclues), alors que `node`,
 * `@prisma/client` et `bcrypt` y sont présents. Le dossier prisma/ étant copié
 * dans l'image, ce script s'exécute directement dans le conteneur :
 *
 *   sudo docker exec wim_api node prisma/seed-demo.js
 *
 * Rejouable : les comptes de démo sont mis à jour plutôt que dupliqués, et
 * leurs logements sont recréés à chaque exécution.
 *
 * Pour tout supprimer :
 *   sudo docker exec wim_db psql -U wim -d wim \
 *     -c "DELETE FROM users WHERE email LIKE '%@demo.worldismine.fr';"
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

// Suffixe qui identifie les comptes de démo et permet de les retrouver.
const DEMO_DOMAIN = '@demo.worldismine.fr';
const DEMO_PASSWORD = 'DemoWim2026';

// Les images doivent être des URL absolues : l'application les passe
// directement à <Image source={{ uri }} />, sans préfixer par l'URL de l'API.
const photo = (seed) => `https://picsum.photos/seed/${seed}/1200/800`;
const avatar = (n) => `https://i.pravatar.cc/300?img=${n}`;

const daysFromNow = (days) => {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
};

const OWNERS = [
  {
    key: 'sophie',
    email: `sophie${DEMO_DOMAIN}`,
    firstName: 'Sophie',
    lastName: 'Martin',
    avatar: avatar(5),
    country: 'France',
    nationality: 'française',
    bio: "Architecte à Lyon, je voyage dès que possible et j'adore accueillir.",
    languages: ['fr', 'en'],
    rating: 5,
  },
  {
    key: 'thomas',
    email: `thomas${DEMO_DOMAIN}`,
    firstName: 'Thomas',
    lastName: 'Leroy',
    avatar: avatar(12),
    country: 'France',
    nationality: 'française',
    bio: 'Photographe basé à Bordeaux. Toujours partant pour un échange.',
    languages: ['fr', 'es'],
    rating: 4,
  },
  {
    key: 'elena',
    email: `elena${DEMO_DOMAIN}`,
    firstName: 'Elena',
    lastName: 'Rossi',
    avatar: avatar(20),
    country: 'Italie',
    nationality: 'italienne',
    bio: 'Je vis à Florence avec mes deux chats. Échange de maison depuis 2019.',
    languages: ['it', 'en', 'fr'],
    rating: 5,
  },
  {
    key: 'marc',
    email: `marc${DEMO_DOMAIN}`,
    firstName: 'Marc',
    lastName: 'Dubois',
    avatar: avatar(33),
    country: 'France',
    nationality: 'française',
    bio: 'Retraité, passionné de montagne et de randonnée.',
    languages: ['fr'],
    rating: 4,
  },
  {
    key: 'lucia',
    email: `lucia${DEMO_DOMAIN}`,
    firstName: 'Lucia',
    lastName: 'Fernandez',
    avatar: avatar(47),
    country: 'Espagne',
    nationality: 'espagnole',
    bio: 'Prof de yoga à Valence, ma maison est ouverte toute l\'année.',
    languages: ['es', 'en'],
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
    amenities: ['wifi', 'kitchen', 'tv', 'washingMachine', 'balcony', 'workspace'],
    pricePerNight: 95,
    averageRating: 4.8,
    reviewsCount: 24,
    carExchangeAccepted: true,
    photos: ['lyon-1', 'lyon-2', 'lyon-3', 'lyon-4'],
    vehicle: {
      brand: 'Renault',
      model: 'Zoe',
      seats: 5,
      type: 'city',
      fuelType: 'ELECTRIC',
      imageUrl: photo('car-zoe'),
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
    amenities: ['wifi', 'kitchen', 'parking', 'tv', 'washingMachine', 'workspace'],
    pricePerNight: 140,
    averageRating: 4.6,
    reviewsCount: 17,
    carExchangeAccepted: true,
    photos: ['bordeaux-1', 'bordeaux-2', 'bordeaux-3', 'bordeaux-4'],
    vehicle: {
      brand: 'Peugeot',
      model: '3008',
      seats: 5,
      type: 'suv',
      fuelType: 'HYBRID',
      imageUrl: photo('car-3008'),
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
    amenities: ['wifi', 'kitchen', 'tv', 'airConditioning'],
    pricePerNight: 160,
    averageRating: 4.9,
    reviewsCount: 41,
    carExchangeAccepted: false,
    photos: ['florence-1', 'florence-2', 'florence-3', 'florence-4'],
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
    amenities: ['wifi', 'kitchen', 'parking', 'tv', 'washingMachine'],
    pricePerNight: 220,
    averageRating: 4.7,
    reviewsCount: 33,
    carExchangeAccepted: true,
    photos: ['chamonix-1', 'chamonix-2', 'chamonix-3', 'chamonix-4'],
    vehicle: {
      brand: 'Volkswagen',
      model: 'Tiguan',
      seats: 5,
      type: 'suv',
      fuelType: 'DIESEL',
      imageUrl: photo('car-tiguan'),
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
    amenities: ['wifi', 'kitchen', 'airConditioning', 'washingMachine', 'balcony'],
    pricePerNight: 110,
    averageRating: 4.5,
    reviewsCount: 12,
    carExchangeAccepted: false,
    photos: ['valence-1', 'valence-2', 'valence-3', 'valence-4'],
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
    amenities: ['wifi', 'kitchen', 'tv', 'workspace'],
    pricePerNight: 65,
    averageRating: 4.4,
    reviewsCount: 9,
    carExchangeAccepted: false,
    photos: ['lyon-studio-1', 'lyon-studio-2', 'lyon-studio-3'],
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
    amenities: ['wifi', 'kitchen', 'parking', 'tv', 'washingMachine', 'balcony'],
    pricePerNight: 310,
    averageRating: 5.0,
    reviewsCount: 28,
    carExchangeAccepted: true,
    photos: ['capferret-1', 'capferret-2', 'capferret-3', 'capferret-4'],
    availabilities: [
      [30, 70],
      [110, 150],
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
    amenities: ['wifi', 'kitchen', 'tv', 'airConditioning', 'workspace'],
    pricePerNight: 130,
    averageRating: 4.3,
    reviewsCount: 6,
    carExchangeAccepted: false,
    photos: ['florence-loft-1', 'florence-loft-2', 'florence-loft-3'],
    availabilities: [[25, 65]],
  },
];

async function main() {
  console.log('[seed] Mots de passe : hachage en cours…');
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  // upsert plutôt que create : le script doit pouvoir être relancé sans
  // dupliquer les comptes ni invalider les sessions existantes.
  const ownersByKey = {};
  for (const owner of OWNERS) {
    const data = {
      firstName: owner.firstName,
      lastName: owner.lastName,
      avatarUrl: owner.avatar,
      bio: owner.bio,
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
      update: data,
      create: { email: owner.email, ...data },
    });
  }
  console.log(`[seed] ${OWNERS.length} comptes de démonstration prêts.`);

  // Les logements sont recréés à chaque exécution. Les photos, disponibilités,
  // véhicules, favoris et swipes associés partent en cascade (onDelete: Cascade).
  const ownerIds = Object.values(ownersByKey).map((u) => u.id);
  const removed = await prisma.home.deleteMany({
    where: { ownerId: { in: ownerIds } },
  });
  if (removed.count > 0) {
    console.log(`[seed] ${removed.count} logements de démo précédents supprimés.`);
  }

  for (const home of HOMES) {
    const owner = ownersByKey[home.owner];

    await prisma.home.create({
      data: {
        ownerId: owner.id,
        title: home.title,
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
        averageRating: home.averageRating,
        reviewsCount: home.reviewsCount,
        carExchangeAccepted: home.carExchangeAccepted,

        photos: {
          create: home.photos.map((seed, index) => ({
            url: photo(seed),
            position: index,
          })),
        },

        // Des périodes futures : la recherche par dates filtre sur
        // startDate <= début demandé et endDate >= fin demandée.
        availabilities: {
          create: home.availabilities.map(([from, to]) => ({
            startDate: daysFromNow(from),
            endDate: daysFromNow(to),
            type: 'AVAILABLE',
          })),
        },

        ...(home.vehicle ? { vehicle: { create: home.vehicle } } : {}),
      },
    });
  }

  const totalPhotos = HOMES.reduce((sum, h) => sum + h.photos.length, 0);
  console.log(`[seed] ${HOMES.length} logements créés, ${totalPhotos} photos.`);
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
