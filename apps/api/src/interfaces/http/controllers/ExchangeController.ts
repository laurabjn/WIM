import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ListMyExchangesUseCase } from 'src/application/exchange/use-cases/list-my-exchanges.usecase';
import {
  CancelExchangeUseCase,
  ExchangeResponse,
  RespondToExchangeUseCase,
  UpdateExchangeDatesUseCase,
} from 'src/application/exchange/use-cases/respond-to-exchange.usecase';
import { GetChatExchangeUseCase } from 'src/application/exchange/use-cases/get-chat-exchange.usecase';
import {
  RequestExchangeInput,
  RequestExchangeUseCase,
} from 'src/application/exchange/use-cases/request-exchange.usecase';
import { JwtAuthGuard } from '../jwt-auth.guard';

@Controller('exchanges')
@UseGuards(JwtAuthGuard)
export class ExchangeController {
  constructor(
    private readonly listMyExchangesUseCase: ListMyExchangesUseCase,
    private readonly respondToExchangeUseCase: RespondToExchangeUseCase,
    private readonly getChatExchangeUseCase: GetChatExchangeUseCase,
    private readonly requestExchangeUseCase: RequestExchangeUseCase,
    private readonly updateExchangeDatesUseCase: UpdateExchangeDatesUseCase,
    private readonly cancelExchangeUseCase: CancelExchangeUseCase,
  ) {}

  @Post()
  async request(
    @Req() req: any,
    @Body() body: Omit<RequestExchangeInput, 'requesterId'>,
  ) {
    return this.requestExchangeUseCase.execute({
      ...body,
      requesterId: req.user.sub,
    });
  }

  @Get('me')
  async findMine(@Req() req: any) {
    return this.listMyExchangesUseCase.execute(req.user.sub);
  }

  @Get('chat/:chatId')
  async findForChat(@Req() req: any, @Param('chatId') chatId: string) {
    return this.getChatExchangeUseCase.execute(chatId, req.user.sub);
  }

  @Patch(':exchangeId/dates')
  async updateDates(
    @Req() req: any,
    @Param('exchangeId') exchangeId: string,
    @Body() body: { startDate: string; endDate: string },
  ) {
    return this.updateExchangeDatesUseCase.execute(
      exchangeId,
      req.user.sub,
      body?.startDate,
      body?.endDate,
    );
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

  @Patch(':exchangeId/cancel')
  async cancel(
    @Req() req: any,
    @Param('exchangeId') exchangeId: string,
  ) {
    return this.cancelExchangeUseCase.execute(exchangeId, req.user.sub);
  }
}
