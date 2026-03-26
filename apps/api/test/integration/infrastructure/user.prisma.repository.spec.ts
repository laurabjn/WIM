import { PrismaService } from '../../../src/infrastructure/database/prisma/prisma.service';
import { UserPrismaRepository } from '../../../src/infrastructure/repositories/user.prisma.repository';

describe('UserPrismaRepository (integration)', () => {
  const prisma = new PrismaService();
  const repo = new UserPrismaRepository(prisma);

  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  it('should save user and detect existing email', async () => {
    await repo.create({
      firstName: 'Laura',
      lastName: 'Smith',
      email: 'laura@example.com',
      passwordHash: 'hashedpassword',
      avatarUrl: null,
      bio: null,
      country: null,
      nationality: null,
      phone: null,
      birthDate: null,
    });

    const user = await repo.findByEmail('laura@example.com');

    expect(user).not.toBeNull();
    expect(user?.email).toBe('laura@example.com');
  });
});
