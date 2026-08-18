import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { UserRepository } from 'src/domain/auth/repositories/user.repository';
import {
  CreateUserPayload,
  IdentityStatus,
  User,
} from 'src/domain/auth/entities/user.entity';

@Injectable()
export class UserPrismaRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;

    return User.fromPersistence(user);
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    return User.fromPersistence(user);
  }

  async create(params: CreateUserPayload): Promise<User> {
    const created = await this.prisma.user.create({
      data: {
        email: params.email,
        passwordHash: params.passwordHash,
        firstName: params.firstName,
        lastName: params.lastName,
        birthDate: params.birthDate,
        avatarUrl: params.avatarUrl,
        bio: params.bio,
        country: params.country,
        nationality: params.nationality,
        phone: params.phone,
      },
    });

    return User.fromPersistence(created);
  }

  async updatePasswordHash(
    userId: string,
    passwordHash: string,
  ): Promise<void> {
    const result = await this.prisma.user.updateMany({
      where: { id: userId },
      data: { passwordHash },
    });

    if (result.count === 0) {
      throw new Error(`UserNotFound: cannot update password for id=${userId}`);
    }
  }

  async updateIdentityStatus(
    userId: string,
    status: IdentityStatus,
  ): Promise<void> {
    await this.prisma.user.updateMany({
      where: { id: userId },
      data: { identityStatus: status as any },
    });
  }

  // updateMany plutot que update : une deconnexion peut suivre la suppression
  // du compte, et une ligne absente ferait alors lever une erreur.
  async touchLastSeen(userId: string): Promise<void> {
    await this.prisma.user.updateMany({
      where: { id: userId },
      data: { lastSeenAt: new Date() },
    });
  }

  async findLastSeen(
    userIds: string[],
  ): Promise<Record<string, string | null>> {
    if (userIds.length === 0) return {};

    const rows = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, lastSeenAt: true },
    });

    return Object.fromEntries(
      rows.map((row) => [row.id, row.lastSeenAt?.toISOString() ?? null]),
    );
  }
}
