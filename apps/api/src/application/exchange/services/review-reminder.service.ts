import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import type { EmailSenderPort } from 'src/application/notifications/ports/email-sender.port';
import { PushSenderService } from 'src/application/notification/push-sender.service';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { EMAIL_SENDER } from 'src/interfaces/http/tokens/token';

const JOUR_MS = 24 * 60 * 60 * 1000;
const DELAI_PREMIER_RAPPEL_MS = JOUR_MS;
const INTERVALLE_ENTRE_RAPPELS_MS = 3 * JOUR_MS;
const SEJOUR_ANCIEN_APRES_MS = 30 * JOUR_MS;
const INTERVALLE_SEJOUR_ANCIEN_MS = 14 * JOUR_MS;
const LOT_MAX = 200;

type Destinataire = {
  userId: string;
  email: string | null;
  firstName: string | null;
  exchangeId: string;
  homeTitle: string;
  partnerFirstName: string;
};

@Injectable()
export class ReviewReminderService {
  private readonly logger = new Logger(ReviewReminderService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pushSender: PushSenderService,
    @Inject(EMAIL_SENDER)
    private readonly emailSender: EmailSenderPort,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async envoyerLesRappels(): Promise<void> {
    try {
      const envoyes = await this.appliquer();

      if (envoyes) {
        this.logger.log(`${envoyes} rappel(s) de notation envoye(s).`);
      }
    } catch (error) {
      this.logger.warn(
        `Rappels de notation impossibles : ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  async appliquer(): Promise<number> {
    const destinataires = await this.destinatairesDuJour();

    for (const destinataire of destinataires) {
      await this.prevenir(destinataire);
    }

    const exchangeIds = [
      ...new Set(destinataires.map((destinataire) => destinataire.exchangeId)),
    ];

    if (exchangeIds.length > 0) {
      await this.prisma.exchange.updateMany({
        where: { id: { in: exchangeIds } },
        data: { reviewReminderAt: new Date() },
      });
    }

    return destinataires.length;
  }

  private async destinatairesDuJour(): Promise<Destinataire[]> {
    const maintenant = Date.now();

    const limiteRecente = new Date(maintenant - INTERVALLE_ENTRE_RAPPELS_MS);
    const limiteAncienne = new Date(maintenant - INTERVALLE_SEJOUR_ANCIEN_MS);
    const bascule = new Date(maintenant - SEJOUR_ANCIEN_APRES_MS);

    const sejours = await this.prisma.exchange.findMany({
      where: {
        status: 'PAST',
        endDate: { lt: new Date(maintenant - DELAI_PREMIER_RAPPEL_MS) },
        OR: [
          { reviewReminderAt: null },
          {
            endDate: { gte: bascule },
            reviewReminderAt: { lt: limiteRecente },
          },
          {
            endDate: { lt: bascule },
            reviewReminderAt: { lt: limiteAncienne },
          },
        ],
      },
      orderBy: { endDate: 'asc' },
      take: LOT_MAX,
      include: {
        home: { select: { title: true } },
        guestHome: { select: { title: true } },
        reviews: { select: { authorId: true } },
      },
    });

    if (sejours.length === 0) return [];

    const identifiants = new Set<string>();

    for (const sejour of sejours) {
      identifiants.add(sejour.hostId);
      identifiants.add(sejour.guestId);
    }

    const personnes = await this.prisma.user.findMany({
      where: { id: { in: [...identifiants] } },
      select: { id: true, email: true, firstName: true },
    });

    const parIdentifiant = new Map(
      personnes.map((personne) => [personne.id, personne]),
    );

    const destinataires: Destinataire[] = [];

    for (const sejour of sejours) {
      const dejaNote = new Set(sejour.reviews.map((avis) => avis.authorId));

      const candidats = [
        {
          userId: sejour.hostId,
          partenaireId: sejour.guestId,
          logement: sejour.guestHome?.title ?? null,
        },
        {
          userId: sejour.guestId,
          partenaireId: sejour.hostId,
          logement: sejour.home.title,
        },
      ];

      for (const candidat of candidats) {
        if (dejaNote.has(candidat.userId) || !candidat.logement) continue;

        const personne = parIdentifiant.get(candidat.userId);
        const partenaire = parIdentifiant.get(candidat.partenaireId);

        destinataires.push({
          userId: candidat.userId,
          email: personne?.email ?? null,
          firstName: personne?.firstName ?? null,
          exchangeId: sejour.id,
          homeTitle: candidat.logement,
          partnerFirstName: partenaire?.firstName ?? '',
        });
      }
    }

    return destinataires;
  }

  private async prevenir(destinataire: Destinataire): Promise<void> {
    const corps = `Votre séjour dans « ${destinataire.homeTitle} » est terminé. Notez-le pour pouvoir organiser un nouvel échange.`;

    await this.pushSender
      .sendToUser(
        destinataire.userId,
        {
          title: 'Notez votre séjour',
          body: corps,
          data: { reviewExchangeId: destinataire.exchangeId },
        },
        { categorie: 'exchanges' },
      )
      .catch(() => undefined);

    if (!destinataire.email) return;

    try {
      await this.emailSender.send({
        to: destinataire.email,
        subject: 'Wim — notez votre séjour',
        text: [
          destinataire.firstName ? `Bonjour ${destinataire.firstName},` : 'Bonjour,',
          '',
          corps,
          '',
          'Tant que ce séjour n’est pas noté, vous ne pouvez ni demander ni accepter un nouvel échange.',
          '',
          'À bientôt sur Wim.',
        ].join(String.fromCharCode(10)),
      });
    } catch (error) {
      this.logger.warn(
        `Rappel non envoye a ${destinataire.email} : ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}
