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
  ListGuestHomesUseCase,
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
import { AnnounceExchangeUseCase } from 'src/application/exchange/use-cases/announce-exchange.usecase';
import { PushSenderService } from 'src/application/notification/push-sender.service';
import { AppGateway } from 'src/interfaces/websocket/app.gateway';
import { ChatRepository } from 'src/domain/auth/repositories/chat.repository';
import { CHAT_REPOSITORY } from '../tokens/token';

@Controller('exchanges')
@UseGuards(JwtAuthGuard)
export class ExchangeController {
  constructor(
    private readonly listMyExchangesUseCase: ListMyExchangesUseCase,
    private readonly respondToExchangeUseCase: RespondToExchangeUseCase,
    private readonly listGuestHomesUseCase: ListGuestHomesUseCase,
    private readonly getChatExchangeUseCase: GetChatExchangeUseCase,
    private readonly requestExchangeUseCase: RequestExchangeUseCase,
    private readonly updateExchangeDatesUseCase: UpdateExchangeDatesUseCase,
    private readonly cancelExchangeUseCase: CancelExchangeUseCase,
    private readonly listStaysToReview: ListStaysToReviewUseCase,
    private readonly reviewStay: ReviewStayUseCase,
    private readonly annonce: AnnounceExchangeUseCase,
    private readonly pushSender: PushSenderService,
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

    // Une demande arrivait sans bruit : rien ne prevenait la personne qui la
    // recoit tant qu'elle n'ouvrait pas l'application.
    const destinataire = chat?.participants.find(
      (participant) => participant.userId !== req.user.sub,
    );

    if (destinataire) {
      await this.pushSender
        .sendToUser(
          destinataire.userId,
          {
            title: "Demande d'échange",
            body: String(result.message?.content ?? '').slice(0, 140),
            data: { chatId: result.chatId },
          },
          { categorie: 'exchanges' },
        )
        .catch(() => undefined);
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
    const exchange = await this.updateExchangeDatesUseCase.execute(
      exchangeId,
      req.user.sub,
      body?.startDate,
      body?.endDate,
    );

    // Rien ne distinguait un changement de dates d'un silence : l'autre
    // personne ne le decouvrait qu'en rouvrant l'echange.
    const annonce = await this.annonce.nouvellesDates(exchangeId, req.user.sub);

    if (annonce) {
      await this.diffuser(annonce.chatId, annonce.message);

      await this.pushSender
        .sendToUser(
          annonce.destinataire,
          {
            title: 'Dates modifiées',
            body: annonce.message.content.slice(0, 140),
            data: { chatId: annonce.chatId },
          },
          { categorie: 'exchanges' },
        )
        .catch(() => undefined);
    }

    return exchange;
  }

  @Get(':exchangeId/guest-homes')
  async guestHomes(
    @Req() req: any,
    @Param('exchangeId') exchangeId: string,
  ) {
    return this.listGuestHomesUseCase.execute(exchangeId, req.user.sub);
  }

  @Patch(':exchangeId/respond')
  async respond(
    @Req() req: any,
    @Param('exchangeId') exchangeId: string,
    @Body() body: { response: ExchangeResponse; guestHomeId?: string },
  ) {
    const reponse = body?.response === 'DECLINE' ? 'DECLINE' : 'ACCEPT';

    const exchange = await this.respondToExchangeUseCase.execute(
      exchangeId,
      req.user.sub,
      reponse,
      body?.guestHomeId,
    );

    // Une acceptation ne laissait aucune trace : la conversation restait
    // classee en demande, et l'autre personne n'apprenait rien.
    if (reponse === 'ACCEPT') {
      const annonce = await this.annonce.acceptation(exchangeId);

      if (annonce) {
        await this.diffuser(annonce.chatId, annonce.message);

        await this.pushSender
          .sendToUser(
            annonce.guestId,
            {
              title: 'Échange accepté',
              body: annonce.message.content.slice(0, 140),
              data: { chatId: annonce.chatId },
            },
            { categorie: 'exchanges' },
          )
          .catch(() => undefined);
      }
    }

    return exchange;
  }

  private async diffuser(chatId: string, message: any) {
    this.gateway.emitMessageCreated(chatId, message);

    const chat = await this.chatRepository.findById(chatId);

    for (const participant of chat?.participants ?? []) {
      this.gateway.emitChatUpdated(participant.userId, {
        chatId,
        lastMessage: message,
        unreadCount: await this.chatRepository.countUnreadMessages(
          chatId,
          participant.userId,
        ),
      });

      this.gateway.emitUnreadCount(
        participant.userId,
        await this.chatRepository.countAllUnreadMessages(participant.userId),
      );
    }
  }

  @Patch(':exchangeId/cancel')
  async cancel(
    @Req() req: any,
    @Param('exchangeId') exchangeId: string,
  ) {
    return this.cancelExchangeUseCase.execute(exchangeId, req.user.sub);
  }
}
