import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from './interfaces/http/modules/http.module';
import { WebsocketModule } from './interfaces/websocket/websocket.module';
import { UploadsModule } from './interfaces/http/modules/uploads.module';
import { ProfileModule } from './interfaces/http/modules/profile.module';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    WebsocketModule,
    UploadsModule,
    ProfileModule,
  ],
})
export class AppModule {}
