import { Body, Controller, Get, Post, Query, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../jwt-auth.guard';
import { CreateSwipeUseCase } from 'src/application/swipe/use-cases/create-swipe.usecase';
import { PushSenderService } from 'src/application/notification/push-sender.service';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { CreateSwipeDto } from 'src/application/swipe/dto/create-swipe.dto';
import { GetSwipeRecommendationsUseCase } from 'src/application/swipe/use-cases/get-swipe-recommendation.usecase';

type AuthenticatedRequest = {
  user?: {
    sub?: string;
    userId?: string;
    id?: string;
  };
};

@Controller('swipes')
@UseGuards(JwtAuthGuard)
export class SwipeController {
  constructor(
    private readonly createSwipeUseCase: CreateSwipeUseCase,
    private readonly getRecommendations: GetSwipeRecommendationsUseCase,
    private readonly pushSender: PushSenderService,
    private readonly prisma: PrismaService,
  ) { }

  @Get('liked-homes')
  async likedHomes(
    @Req() req: AuthenticatedRequest,
    @Query('ownerId') ownerId: string,
  ) {
    const swiperId = req.user?.sub ?? req.user?.userId ?? req.user?.id;

    if (!swiperId) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }

    const swipes = await this.prisma.swipe.findMany({
      where: { swiperId, targetUserId: ownerId, direction: 'LIKE' },
      orderBy: { createdAt: 'asc' },
      select: {
        home: {
          select: {
            id: true,
            title: true,
            photos: {
              orderBy: { position: 'asc' },
              take: 1,
              select: { url: true },
            },
          },
        },
      },
    });

    return swipes.map((swipe) => ({
      id: swipe.home.id,
      title: swipe.home.title,
      imageUrl: swipe.home.photos[0]?.url ?? null,
    }));
  }

  @Post()
  async create(@Req() req: any, @Body() dto: CreateSwipeDto) {
    const swiperId = req.user?.sub ?? req.user?.userId ?? req.user?.id;

    if (!swiperId) {
      throw new UnauthorizedException(
        'Utilisateur non authentifié',
      );
    }

    const resultat = await this.createSwipeUseCase.execute({
      swiperId,
      targetUserId: dto.targetUserId,
      homeId: dto.homeId,
      direction: dto.direction,
    });

    if (resultat.match) {
      await this.annoncerLeMatch(swiperId, dto.targetUserId, resultat.chatId);
    }

    return resultat;
  }

  private async annoncerLeMatch(
    swiperId: string,
    targetUserId: string,
    chatId?: string,
  ): Promise<void> {
    const swiper = await this.prisma.user.findUnique({
      where: { id: swiperId },
      select: { firstName: true },
    });

    const prenom = swiper?.firstName?.trim();

    await this.pushSender
      .sendToUser(
        targetUserId,
        {
          title: 'Nouveau match',
          body: prenom
            ? `${prenom} aime aussi votre logement. Lancez la conversation !`
            : 'Quelqu’un aime aussi votre logement. Lancez la conversation !',
          data: chatId ? { chatId } : {},
        },
        { categorie: 'exchanges' },
      )
      .catch(() => undefined);
  }

  @Get('recommendations')
  async recommendations(
    @Req() request: AuthenticatedRequest,
    @Query('limit') limit?: string,
  ) {
    const userId = request.user?.sub ?? request.user?.userId ?? request.user?.id;

    if (!userId) {
      throw new UnauthorizedException(
        'Utilisateur non authentifié',
      );
    }
    const parsedLimit = Number(limit);

    const safeLimit = Number.isFinite(parsedLimit) &&
      parsedLimit > 0
        ? Math.min(parsedLimit, 50)
      : 20;
    
    return this.getRecommendations.execute({
      userId,
      limit: safeLimit,
    });
  }

}