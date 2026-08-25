import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';

const FORMAT = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: '2-digit',
});

@Injectable()
export class AnnounceExchangeAcceptedUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(exchangeId: string) {
    const exchange = await this.prisma.exchange.findUnique({
      where: { id: exchangeId },
      include: {
        home: { select: { title: true } },
        guestHome: { select: { title: true } },
      },
    });

    if (!exchange) return null;

    const chat = await this.prisma.chat.findFirst({
      where: {
        AND: [
          { participants: { some: { userId: exchange.hostId } } },
          { participants: { some: { userId: exchange.guestId } } },
        ],
      },
      select: { id: true },
    });

    if (!chat) return null;

    const message = await this.prisma.message.create({
      data: {
        chatId: chat.id,
        senderId: exchange.hostId,
        content: this.texte(exchange),
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });

    return { chatId: chat.id, message, guestId: exchange.guestId };
  }

  private texte(exchange: {
    startDate: Date;
    endDate: Date;
    home: { title: string };
    guestHome: { title: string } | null;
  }): string {
    const sejour = `du ${FORMAT.format(exchange.startDate)} au ${FORMAT.format(
      exchange.endDate,
    )}`;

    if (exchange.guestHome) {
      return `Échange accepté ${sejour} : vous serez dans « ${exchange.home.title} », et je serai dans « ${exchange.guestHome.title} ».`;
    }

    return `Échange accepté ${sejour} : vous serez dans « ${exchange.home.title} ».`;
  }
}
