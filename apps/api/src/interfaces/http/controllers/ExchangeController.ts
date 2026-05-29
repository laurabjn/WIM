import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ListMyExchangesUseCase } from 'src/application/exchange/use-cases/list-my-exchanges.usecase';
import { JwtAuthGuard } from '../jwt-auth.guard';

@Controller('exchanges')
export class ExchangeController {
  constructor(
    private readonly listMyExchangesUseCase: ListMyExchangesUseCase,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async findMine(@Req() req: any) {
    return this.listMyExchangesUseCase.execute(req.user.sub);
  }
}