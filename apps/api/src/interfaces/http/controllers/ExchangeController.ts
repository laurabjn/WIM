import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ListMyExchangesUseCase } from 'src/application/exchange/use-cases/list-my-exchanges.usecase';
import {
  ExchangeResponse,
  RespondToExchangeUseCase,
} from 'src/application/exchange/use-cases/respond-to-exchange.usecase';
import { GetChatExchangeUseCase } from 'src/application/exchange/use-cases/get-chat-exchange.usecase';
import { JwtAuthGuard } from '../jwt-auth.guard';

@Controller('exchanges')
@UseGuards(JwtAuthGuard)
export class ExchangeController {
  constructor(
    private readonly listMyExchangesUseCase: ListMyExchangesUseCase,
    private readonly respondToExchangeUseCase: RespondToExchangeUseCase,
    private readonly getChatExchangeUseCase: GetChatExchangeUseCase,
  ) {}

  @Get('me')
  async findMine(@Req() req: any) {
    return this.listMyExchangesUseCase.execute(req.user.sub);
  }

  @Get('chat/:chatId')
  async findForChat(@Req() req: any, @Param('chatId') chatId: string) {
    return this.getChatExchangeUseCase.execute(chatId, req.user.sub);
  }

  @Patch(':exchangeId/respond')
  async respond(
    @Req() req: any,
    @Param('exchangeId') exchangeId: string,
    @Body() body: { response: ExchangeResponse },
  ) {
    return this.respondToExchangeUseCase.execute(
      exchangeId,
      req.user.sub,
      body?.response === 'DECLINE' ? 'DECLINE' : 'ACCEPT',
    );
  }
}
