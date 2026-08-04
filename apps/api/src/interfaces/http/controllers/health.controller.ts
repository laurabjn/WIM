import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  // Route publique (pas de JwtAuthGuard) : elle est appelée par le healthcheck
  // Docker et par le monitoring externe, qui n'ont pas de token.
  @Get()
  async check() {
    try {
      // Un `SELECT 1` vérifie que la connexion est réellement utilisable, là où
      // un simple "l'API répond" resterait vert avec une base injoignable.
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      throw new ServiceUnavailableException({
        status: 'error',
        database: 'unreachable',
      });
    }

    return {
      status: 'ok',
      database: 'up',
      uptime: Math.round(process.uptime()),
    };
  }
}
