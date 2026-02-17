import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.home.create({
    data: {
      ownerId: crypto.randomUUID(),
      title: 'Test Home Dublin',
      description: 'Seed home',
      address: '1 Example Street',
      city: 'Dublin',
      country: 'Ireland',
      latitude: 53.349805,
      longitude: -6.26031,
      capacity: 2,
      homeType: 'APARTMENT',
      amenities: ['wifi', 'kitchen'],
    },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
