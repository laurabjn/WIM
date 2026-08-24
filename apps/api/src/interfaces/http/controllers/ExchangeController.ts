import {
  Body,
  Controller,
  Get,
  Inject,
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
import {
  ListStaysToReviewUseCase,
  ReviewStayUseCase,
} from 'src/application/exchange/use-cases/review-stay.usecase';
import { JwtAuthGuard } from '../jwt-auth.guard';
import { AppGateway } from 'src/interfaces/websocket/app.gateway';
import { ChatRepository } from 'src/domain/auth/repositories/chat.repository';
import { CHAT_REPOSITORY } from '../tokens/token';

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
    private readonly listStaysToReview: ListStaysToReviewUseCase,
    private readonly reviewStay: ReviewStayUseCase,
    private readonly gateway: AppGateway,
    @Inject(CHAT_REPOSITORY)
    private readonly chatRepository: ChatRepository,
  ) {}

  @Get('stays-to-review')
  async staysToReview(@Req() req: any) {
    return this.listStaysToReview.execute(req.user.sub);
  }

  @Post(':exchangeId/review')
  async review(
    @Req() req: any,
    @Param('exchangeId') exchangeId: string,
    @Body() body: { score?: number; comment?: string },
  ) {
    return this.reviewStay.execute(
      exchangeId,
      req.user.sub,
      Number(body?.score),
      body?.comment ?? '',
    );
  }

  @Post()
  async request(
    @Req() req: any,
    @Body() body: Omit<RequestExchangeInput, 'requesterId'>,
  ) {
    const result = await this.requestExchangeUseCase.execute({
      ...body,
      requesterId: req.user.sub,
    });

    // Le message d'introduction etait ecrit directement en base : sans cette
    // annonce, ni l'auteur ni le destinataire ne le voyaient arriver.
    this.gateway.emitMessageCreated(result.chatId, result.message);

    const chat = await this.chatRepository.findById(result.chatId);

    for (const participant of chat?.participants ?? []) {
      const unreadCount = await this.chatRepository.countUnreadMessages(
        result.chatId,
        participant.userId,
      );

      this.gateway.emitChatUpdated(participant.userId, {
        chatId: result.chatId,
        lastMessage: result.message,
        unreadCount,
      });

      this.gateway.emitUnreadCount(
        participant.userId,
        await this.chatRepository.countAllUnreadMessages(participant.userId),
      );
    }

    return result;
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
