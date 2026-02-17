// test/integration/infrastructure/user.prisma.repository.spec.ts
import { PrismaService } from '../../../src/infrastructure/database/prisma/prisma.service';
import { UserPrismaRepository } from '../../../src/infrastructure/repositories/user.prisma.repository';
import { Email } from '../../../src/domain/value-objects/email.vo';
import { User } from '../../../src/domain/entities/user.entity';

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
    // reset table
    await prisma.user.deleteMany();
  });

  it('should save user and detect existing email', async () => {
    const email = Email.create('laura@example.com');
    const user = User.create({ email });

    await repo.save(user);

    const exists = await repo.existsByEmail('laura@example.com');
    expect(exists).toBe(true);
  });
});
