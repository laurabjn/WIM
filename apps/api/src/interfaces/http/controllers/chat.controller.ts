import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../jwt-auth.guard';
import { SendMessageDto } from 'src/application/message/dto/send-message.dto';
import { GetChatMessagesDto } from 'src/application/message/dto/get-chat-messages.dto';
import { GetChatMessagesUseCase } from 'src/application/message/use-cases/get-chat-messages.usecase';
import { GetMyChatsUseCase } from 'src/application/message/use-cases/get-my-chat.usecase';
import { SendMessageUseCase } from 'src/application/message/use-cases/send-message.usecase';
import { MarkChatAsReadUseCase } from 'src/application/message/use-cases/mark-chat-as-read.usecase';
import { GetUnreadCountUseCase } from 'src/application/message/use-cases/get-unread-count.usecase';

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
    private readonly getMessages: GetChatMessagesUseCase,
    private readonly sendMessage: SendMessageUseCase,
    private readonly markChatAsRead: MarkChatAsReadUseCase,
    private readonly getUnreadCount: GetUnreadCountUseCase,
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

  @Get('unread-count')
  countUnread(@Req() request: AuthenticatedRequest) {
    return this.getUnreadCount.execute(this.getUserId(request));
  }

  @Patch(':chatId/read')
  markAsRead(
    @Req() request: AuthenticatedRequest,
    @Param('chatId')
    chatId: string,
  ) {
    return this.markChatAsRead.execute(chatId, this.getUserId(request));
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
    });
  }

  @Post(':chatId/messages')
  createMessage(
    @Req() request: AuthenticatedRequest,
    @Param('chatId')
    chatId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.sendMessage.execute({
      chatId,
      senderId: this.getUserId(request),
      content: dto.content,
    });
  }
}