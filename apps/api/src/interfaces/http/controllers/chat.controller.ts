import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../jwt-auth.guard';
import { SendMessageDto } from 'src/application/message/dto/send-message.dto';
import { GetChatMessagesUseCase } from 'src/application/message/use-cases/get-chat-messages.usecase';
import { GetMyChatsUseCase } from 'src/application/message/use-cases/get-my-chat.usecase';
import { SendMessageUseCase } from 'src/application/message/use-cases/send-message.usecase';

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

  @Get(':chatId/messages')
  findMessages(
    @Req() request: AuthenticatedRequest,
    @Param('chatId')
    chatId: string,
  ) {
    return this.getMessages.execute(
      chatId,
      this.getUserId(request),
    );
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