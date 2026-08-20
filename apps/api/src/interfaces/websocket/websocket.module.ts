import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AppGateway } from './app.gateway';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { ChatPrismaRepository } from 'src/infrastructure/repositories/chat.prisma.repository';
import { UserPrismaRepository } from 'src/infrastructure/repositories/user.prisma.repository';
import {
  CHAT_REPOSITORY,
  USER_REPOSITORY,
} from 'src/interfaces/http/tokens/token';

@Module({
  imports: [JwtModule.register({})],
  providers: [
    AppGateway,
    PrismaService,
    {
      provide: CHAT_REPOSITORY,
      useClass: ChatPrismaRepository,
    },
    {
      provide: USER_REPOSITORY,
      useClass: UserPrismaRepository,
    },
  ],
  exports: [AppGateway],
})
export class WebsocketModule {}
