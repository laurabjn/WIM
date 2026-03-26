import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from './interfaces/http/modules/http.module';
import { WebsocketModule } from './interfaces/websocket/websocket.module';
import { UploadsModule } from './interfaces/http/modules/uploads.module';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    WebsocketModule,
    UploadsModule,
  ],
})
export class AppModule {}
