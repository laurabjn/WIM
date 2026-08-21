import { Inject } from '@nestjs/common';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { basename, extname } from 'path';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { JwtAuthGuard } from '../jwt-auth.guard';
import { SendMessageDto } from 'src/application/message/dto/send-message.dto';
import { GetChatMessagesDto } from 'src/application/message/dto/get-chat-messages.dto';
import { GetChatMessagesUseCase } from 'src/application/message/use-cases/get-chat-messages.usecase';
import { GetMyChatsUseCase } from 'src/application/message/use-cases/get-my-chat.usecase';
import { GetMyRequestsUseCase } from 'src/application/message/use-cases/get-my-requests.usecase';
import { SendMessageUseCase } from 'src/application/message/use-cases/send-message.usecase';
import { MarkChatAsReadUseCase } from 'src/application/message/use-cases/mark-chat-as-read.usecase';
import { GetUnreadCountUseCase } from 'src/application/message/use-cases/get-unread-count.usecase';
import { AppGateway } from 'src/interfaces/websocket/app.gateway';
import { ChatRepository } from 'src/domain/auth/repositories/chat.repository';
import { transcodeToM4a } from 'src/infrastructure/media/audio-transcoder';
import { PushSenderService } from 'src/application/notification/push-sender.service';
import { CHAT_REPOSITORY } from '../tokens/token';
import type { ChatMessages } from '@wim/shared';
import {
  DeleteMessageUseCase,
  EditMessageUseCase,
  HideChatUseCase,
  SearchMessagesUseCase,
} from 'src/application/message/use-cases/edit-message.usecase';

function editFileName(
  _req: unknown,
  file: Express.Multer.File,
  callback: (error: Error | null, filename: string) => void,
) {
  const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  callback(null, `${unique}${extname(file.originalname)}`);
}

function imageFileFilter(
  _req: unknown,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) {
  if (!file.mimetype.match(/\/(jpg|jpeg|png|webp|heic)$/)) {
    return callback(
      new BadRequestException('Seules les images sont acceptées.'),
      false,
    );
  }
  callback(null, true);
}

function audioFileFilter(
  _req: unknown,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) {
  if (!file.mimetype.match(/^audio\/|^video\/(mp4|3gpp)$/)) {
    return callback(
      new BadRequestException('Seuls les enregistrements audio sont acceptés.'),
      false,
    );
  }
  callback(null, true);
}

type AuthenticatedRequest = {
  user?: {
    sub?: string;
    userId?: string;
    id?: string;
  };
};

@Controller('chats')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(
    private readonly getMyChats: GetMyChatsUseCase,
    private readonly getMyRequests: GetMyRequestsUseCase,
    private readonly getMessages: GetChatMessagesUseCase,
    private readonly sendMessage: SendMessageUseCase,
    private readonly markChatAsRead: MarkChatAsReadUseCase,
    private readonly getUnreadCount: GetUnreadCountUseCase,
    private readonly gateway: AppGateway,
    private readonly pushSender: PushSenderService,
    private readonly editMessage: EditMessageUseCase,
    private readonly deleteMessage: DeleteMessageUseCase,
    private readonly hideChat: HideChatUseCase,
    private readonly searchInChat: SearchMessagesUseCase,
    @Inject(CHAT_REPOSITORY)
    private readonly chatRepository: ChatRepository,
  ) {}

  private getUserId(
    request: AuthenticatedRequest,
  ): string {
    const userId =
      request.user?.sub ??
      request.user?.userId ??
      request.user?.id;

    if (!userId) {
      throw new UnauthorizedException();
    }

    return userId;
  }

  @Get()
  findMine(
    @Req() request: AuthenticatedRequest,
  ) {
    return this.getMyChats.execute(
      this.getUserId(request),
    );
  }

  @Get('requests')
  findMyRequests(
    @Req() request: AuthenticatedRequest,
  ) {
    return this.getMyRequests.execute(
      this.getUserId(request),
    );
  }

  @Get('unread-count')
  countUnread(@Req() request: AuthenticatedRequest) {
    return this.getUnreadCount.execute(this.getUserId(request));
  }

  @Patch(':chatId/read')
  async markAsRead(
    @Req() request: AuthenticatedRequest,
    @Param('chatId')
    chatId: string,
  ) {
    const result = await this.markChatAsRead.execute(
      chatId,
      this.getUserId(request),
    );

    this.gateway.emitMessagesRead(result);

    const userId = this.getUserId(request);
    this.gateway.emitUnreadCount(
      userId,
      await this.chatRepository.countAllUnreadMessages(userId),
    );

    return result;
  }

  @Get(':chatId/messages')
  findMessages(
    @Req() request: AuthenticatedRequest,
    @Param('chatId')
    chatId: string,
    @Query() query: GetChatMessagesDto,
  ) {
    return this.getMessages.execute({
      chatId,
      userId: this.getUserId(request),
      cursor: query.cursor,
      limit: query.limit,
      translate: query.translate,
    });
  }

  @Post(':chatId/messages')
  async createMessage(
    @Req() request: AuthenticatedRequest,
    @Param('chatId')
    chatId: string,
    @Body() dto: SendMessageDto,
  ) {
    const message = await this.sendMessage.execute({
      chatId,
      senderId: this.getUserId(request),
      content: dto.content,
      replyToId: dto.replyToId ?? null,
    });

    this.gateway.emitMessageCreated(chatId, message);
    await this.notifyChatUpdated(chatId, message);

    return message;
  }

  @Post(':chatId/photos')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/messages',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
      limits: { fileSize: 8 * 1024 * 1024 },
    }),
  )
  async createPhotoMessage(
    @Req() request: AuthenticatedRequest,
    @Param('chatId')
    chatId: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Aucun fichier image reçu.');
    }

    const message = await this.sendMessage.execute({
      chatId,
      senderId: this.getUserId(request),
      content: '',
      type: 'IMAGE',
      attachmentUrl: `/uploads/messages/${file.filename}`,
    });

    this.gateway.emitMessageCreated(chatId, message);
    await this.notifyChatUpdated(chatId, message);

    return message;
  }

  @Post(':chatId/voice')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/messages',
        filename: editFileName,
      }),
      fileFilter: audioFileFilter,
      limits: { fileSize: 25 * 1024 * 1024 },
    }),
  )
  async createVoiceMessage(
    @Req() request: AuthenticatedRequest,
    @Param('chatId')
    chatId: string,
    @Body() dto: { durationMs?: string; transcript?: string },
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Aucun enregistrement reçu.');
    }

    const duration = Number.parseInt(dto?.durationMs ?? '', 10);

    const { chemin } = await transcodeToM4a(file.path);

    const nomFinal = basename(chemin);

    const message = await this.sendMessage.execute({
      chatId,
      senderId: this.getUserId(request),
      content: dto?.transcript?.slice(0, 5000) ?? '',
      type: 'AUDIO',
      attachmentUrl: `/uploads/messages/${nomFinal}`,
      attachmentDurationMs:
        Number.isFinite(duration) && duration > 0 ? duration : null,
    });

    this.gateway.emitMessageCreated(chatId, message);
    await this.notifyChatUpdated(chatId, message);

    return message;
  }

  @Get(':chatId/messages/search')
  async searchMessages(
    @Req() request: AuthenticatedRequest,
    @Param('chatId') chatId: string,
    @Query('q') query?: string,
  ) {
    return this.searchInChat.execute(
      chatId,
      this.getUserId(request),
      query ?? '',
    );
  }

  @Patch(':chatId/messages/:messageId')
  async editMessageRoute(
    @Req() request: AuthenticatedRequest,
    @Param('chatId') chatId: string,
    @Param('messageId') messageId: string,
    @Body() dto: { content?: string },
  ) {
    const message = await this.editMessage.execute(
      messageId,
      this.getUserId(request),
      dto?.content ?? '',
    );

    this.gateway.emitMessageUpdated(chatId, message);

    return message;
  }

  @Delete(':chatId/messages/:messageId')
  async deleteMessageRoute(
    @Req() request: AuthenticatedRequest,
    @Param('chatId') chatId: string,
    @Param('messageId') messageId: string,
  ) {
    await this.deleteMessage.execute(messageId, this.getUserId(request));

    this.gateway.emitMessageDeleted(chatId, messageId);

    return { deleted: true };
  }

  @Delete(':chatId')
  async hideChatRoute(
    @Req() request: AuthenticatedRequest,
    @Param('chatId') chatId: string,
  ) {
    await this.hideChat.execute(chatId, this.getUserId(request));

    return { hidden: true };
  }

  private async notifyChatUpdated(chatId: string, lastMessage) {
    const chat = await this.chatRepository.findById(chatId);

    if (!chat) return;

    for (const participant of chat.participants) {
      const unreadCount = await this.chatRepository.countUnreadMessages(
        chatId,
        participant.userId,
      );

      this.gateway.emitChatUpdated(participant.userId, {
        chatId,
        lastMessage,
        unreadCount,
      });

      this.gateway.emitUnreadCount(
        participant.userId,
        await this.chatRepository.countAllUnreadMessages(participant.userId),
      );

      await this.notifierParPush(chatId, lastMessage, participant.userId);
    }
  }

  private async notifierParPush(
    chatId: string,
    lastMessage: ChatMessages,
    destinataireId: string,
  ): Promise<void> {
    if (destinataireId === lastMessage.senderId) return;

    if (await this.gateway.isViewingChat(destinataireId, chatId)) return;

    const apercu =
      lastMessage.type === 'IMAGE'
        ? 'Photo'
        : lastMessage.type === 'AUDIO'
          ? 'Message vocal'
          : lastMessage.content;

    await this.pushSender
      .sendToUser(destinataireId, {
        title: lastMessage.sender.firstName,
        body: apercu.slice(0, 140),
        data: { chatId },
      })
      .catch(() => undefined);
  }
}