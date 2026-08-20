import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from './interfaces/http/modules/http.module';
import { WebsocketModule } from './interfaces/websocket/websocket.module';
import { UploadsModule } from './interfaces/http/modules/uploads.module';
import { ProfileModule } from './interfaces/http/modules/profile.module';
import { SupportModule } from './interfaces/http/modules/support.module';
import { HomeModule } from './interfaces/http/modules/home.module';
import { HomeAvailabilityModule } from './interfaces/http/modules/home-availability.module';
import { ExchangeModule } from './interfaces/http/modules/exchange.module';
import { FavoriteModule } from './interfaces/http/modules/favorite.module';
import { SwipeModule } from './interfaces/http/modules/swipe.module';
import { LocationModule } from './interfaces/http/modules/location.module';
import { ChatModule } from './interfaces/http/modules/chat.module';
import { HealthModule } from './interfaces/http/modules/health.module';
import { ModerationModule } from './interfaces/http/modules/moderation.module';
import { NotificationModule } from './interfaces/http/modules/notification.module';
import { AdminModule } from './interfaces/http/modules/admin.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    HttpModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    WebsocketModule,
    UploadsModule,
    ProfileModule,
    SupportModule,
    HomeModule,
    HomeAvailabilityModule,
    ExchangeModule,
    FavoriteModule,
    SwipeModule,
    LocationModule,
    ChatModule,
    NotificationModule,
    AdminModule,
    HealthModule,
    ModerationModule
  ],
})
export class AppModule {}
