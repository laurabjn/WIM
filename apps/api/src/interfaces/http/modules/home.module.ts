import { Module } from '@nestjs/common';
import { AddHomePhotoUseCase } from 'src/application/home/use-cases/add-home-photo.usecase';
import { CreateHomeUseCase } from 'src/application/home/use-cases/create-home.usecase';
import { DeleteHomeUseCase } from 'src/application/home/use-cases/delete-home.usecase';
import { GetHomeByIdUseCase } from 'src/application/home/use-cases/get-home-by-id.usecase';
import { ListMyHomesUseCase } from 'src/application/home/use-cases/list-my-homes.usecase';
import { UpdateHomeUseCase } from 'src/application/home/use-cases/update-home.usecase';
import { HomeController } from '../controllers/home.controller';
import { HomeRepositoryPrisma } from 'src/infrastructure/repositories/home.prisma.repository';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { HOME_REPOSITORY } from '../tokens/token';
import { AuthModule } from './auth.module';
import { ListPublicHomesUseCase } from 'src/application/home/use-cases/list-public-home.usecase';
import { AddFavoriteUseCase } from 'src/application/favorite/use-case/add-favorite.usecase';
import { RemoveFavoriteUseCase } from 'src/application/favorite/use-case/remove-favorite.usecae';

@Module({
  imports: [AuthModule],
  controllers: [HomeController],
  providers: [
    PrismaService,
    HomeRepositoryPrisma,
    {
      provide: HOME_REPOSITORY,
      useExisting: HomeRepositoryPrisma,
    },
    {
      provide: CreateHomeUseCase,
      useFactory: (homeRepo) => new CreateHomeUseCase(homeRepo),
      inject: [HOME_REPOSITORY],
    },
    {
      provide: GetHomeByIdUseCase,
      useFactory: (homeRepo) => new GetHomeByIdUseCase(homeRepo),
      inject: [HOME_REPOSITORY],
    },
    {
      provide: ListMyHomesUseCase,
      useFactory: (homeRepo) => new ListMyHomesUseCase(homeRepo),
      inject: [HOME_REPOSITORY],
    },
    {
      provide: ListPublicHomesUseCase,
      useFactory: (homeRepo) => new ListPublicHomesUseCase(homeRepo),
      inject: [HOME_REPOSITORY],
    },
    {
      provide: UpdateHomeUseCase,
      useFactory: (homeRepo) => new UpdateHomeUseCase(homeRepo),
      inject: [HOME_REPOSITORY],
    },
    {
      provide: DeleteHomeUseCase,
      useFactory: (homeRepo) => new DeleteHomeUseCase(homeRepo),
      inject: [HOME_REPOSITORY],
    },
    {
      provide: AddHomePhotoUseCase,
      useFactory: (homeRepo) => new AddHomePhotoUseCase(homeRepo),
      inject: [HOME_REPOSITORY],
    },
    {
      provide: AddFavoriteUseCase,
      useFactory: (homeRepo) => new AddFavoriteUseCase(homeRepo),
      inject: [HOME_REPOSITORY],
    },
    {
      provide: RemoveFavoriteUseCase,
      useFactory: (homeRepo) => new RemoveFavoriteUseCase(homeRepo),
      inject: [HOME_REPOSITORY],
    }
  ],
})
export class HomeModule {}