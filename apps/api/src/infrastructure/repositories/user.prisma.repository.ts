import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/user.repository';
import { User, CreateUserPayload } from '../../domain/entities/user.entity';
import { PrismaService } from '../database/prisma/prisma.service';

@Injectable()
export class UserPrismaRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;

    return User.create({
      email: user.email,
      passwordHash: user.passwordHash,
      firstName: user.firstName,
      lastName: user.lastName,
    });
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

    return User.create({
      email: created.email,
      passwordHash: created.passwordHash,
      firstName: created.firstName,
      lastName: created.lastName,
    });
  }
}
