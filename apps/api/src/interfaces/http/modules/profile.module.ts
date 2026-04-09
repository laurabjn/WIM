import { Module } from '@nestjs/common';
import { ProfileController } from '../controllers/profile.controller';
import { PrismaProfileRepository } from 'src/infrastructure/repositories/profile.prisma.repository';
import { GetMyProfileUseCase } from 'src/application/profile/use-cases/get-my-profile.usecase';
import { UpdateMyProfileUseCase } from 'src/application/profile/use-cases/update-my-profile.usecase';
import { UploadMyAvatarUseCase } from 'src/application/profile/use-cases/upload-my-avatar.usecase';
import { GetPublicProfileUseCase } from 'src/application/profile/use-cases/get-public-profile.usecase';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';

@Module({
  controllers: [ProfileController],
  providers: [
    PrismaService,
    PrismaProfileRepository,
    {
      provide: GetMyProfileUseCase,
      useFactory: (repo: PrismaProfileRepository) => new GetMyProfileUseCase(repo),
      inject: [PrismaProfileRepository],
    },
    {
      provide: UpdateMyProfileUseCase,
      useFactory: (repo: PrismaProfileRepository) => new UpdateMyProfileUseCase(repo),
      inject: [PrismaProfileRepository],
    },
    {
      provide: UploadMyAvatarUseCase,
      useFactory: (repo: PrismaProfileRepository) => new UploadMyAvatarUseCase(repo),
      inject: [PrismaProfileRepository],
    },
    {
      provide: GetPublicProfileUseCase,
      useFactory: (repo: PrismaProfileRepository) => new GetPublicProfileUseCase(repo),
      inject: [PrismaProfileRepository],
    },
  ],
})
export class ProfileModule {}