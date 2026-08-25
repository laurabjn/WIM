import { Module } from '@nestjs/common';
import { FAVORITE_REPOSITORY } from '../tokens/token';
import { AuthModule } from './auth.module';
import { FavoriteController } from '../controllers/favorite.controller';
import { FavoriteRepositoryPrisma } from 'src/infrastructure/repositories/favorite.prisma.repository';
import { ListFavoritesUseCase } from 'src/application/favorite/use-case/list-favorite.usecase';
import { RemoveFavoriteUseCase } from 'src/application/favorite/use-case/remove-favorite.usecae';
import { AddFavoriteUseCase } from 'src/application/favorite/use-case/add-favorite.usecase';

import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';

@Module({
  imports: [AuthModule],
  controllers: [FavoriteController],
    providers: [
    PrismaService,
    FavoriteRepositoryPrisma,
    {
        provide: FAVORITE_REPOSITORY,
        useExisting: FavoriteRepositoryPrisma,
    },
    {
        provide: AddFavoriteUseCase,
        useFactory: (repo) => new AddFavoriteUseCase(repo),
        inject: [FAVORITE_REPOSITORY],
    },
    {
        provide: RemoveFavoriteUseCase,
        useFactory: (repo) => new RemoveFavoriteUseCase(repo),
        inject: [FAVORITE_REPOSITORY],
    },
    {
        provide: ListFavoritesUseCase,
        useFactory: (repo) => new ListFavoritesUseCase(repo),
        inject: [FAVORITE_REPOSITORY],
    },
  ]
})
export class FavoriteModule {}