import { Module } from '@nestjs/common';

import { CityImageService } from 'src/application/location/city-image.service';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { LocationController } from '../controllers/location.controller';

@Module({
  controllers: [LocationController],
  providers: [CityImageService, PrismaService],
})
export class LocationModule {}
