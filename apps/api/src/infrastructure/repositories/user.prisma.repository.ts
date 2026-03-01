import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { UserRepository } from 'src/domain/auth/repositories/user.repository';
import { CreateUserPayload, User } from 'src/domain/auth/entities/user.entity';

@Injectable()
export class UserPrismaRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
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
}
