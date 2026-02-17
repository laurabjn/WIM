// src/infrastructure/modules/infrastructure.module.ts
import { Module } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class InfrastructureModule {}
