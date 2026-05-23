import { Controller, UseGuards, Post, Req, Param, Get, Delete } from "@nestjs/common";
import { AddFavoriteUseCase } from "src/application/favorite/use-case/add-favorite.usecase";
import { ListFavoritesUseCase } from "src/application/favorite/use-case/list-favorite.usecase";
import { RemoveFavoriteUseCase } from "src/application/favorite/use-case/remove-favorite.usecae";
import { JwtAuthGuard } from "../jwt-auth.guard";

@Controller('favorites')
export class FavoriteController {
  constructor(
    private readonly addFavoriteUseCase: AddFavoriteUseCase,
    private readonly removeFavoriteUseCase: RemoveFavoriteUseCase,
    private readonly listFavoritesUseCase: ListFavoritesUseCase
  ) { }
    
  @UseGuards(JwtAuthGuard)
  @Post(':homeId')
  addFavorite(@Req() req: any, @Param('homeId') homeId: string) {
    return this.addFavoriteUseCase.execute(req.user.sub, homeId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':homeId')
  removeFavorite(@Req() req: any, @Param('homeId') homeId: string) {
    return this.removeFavoriteUseCase.execute(req.user.sub, homeId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  listFavorites(@Req() req: any) {
    return this.listFavoritesUseCase.execute(req.user.sub);
  }
}