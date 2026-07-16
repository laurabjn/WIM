import { Module } from '@nestjs/common';
import { LocationController } from '../controllers/location.controller';

@Module({
  controllers: [LocationController],
})
export class LocationModule {}