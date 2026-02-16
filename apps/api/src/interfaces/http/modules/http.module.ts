import { Module } from '@nestjs/common';
import { HealthController } from '../controllers/health.controller';
import { ApplicationModule } from './application.module';

@Module({
  imports: [ApplicationModule],
  controllers: [HealthController],
})
export class HttpModule {}
