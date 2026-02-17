// src/infrastructure/repositories/user.prisma.repository.ts
import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/user.repository';
import { User as DomainUser } from '../../domain/entities/user.entity';
import { PrismaService } from '../database/prisma/prisma.service';

@Injectable()
export class UserPrismaRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async existsByEmail(email: string): Promise<boolean> {
    const found = await this.prisma.user.findUnique({ where: { email } });
    return !!found;
  }

  async save(user: DomainUser): Promise<void> {
    await this.prisma.user.create({
      data: {
        id: user.id,
        email: user.email.value,
      },
    });
  }
}
