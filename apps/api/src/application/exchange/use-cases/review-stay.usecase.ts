import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { isOffensive } from 'src/application/moderation/offensive-language';

const NOTE_MIN = 1;
const NOTE_MAX = 5;
const COMMENTAIRE_MIN = 10;
const COMMENTAIRE_MAX = 1000;

export type StayToReview = {
  exchangeId: string;
  homeId: string;
  homeTitle: string;
  homePhotoUrl: string | null;
  partnerFirstName: string;
  startDate: string;
  endDate: string;
};

/**
 * Le logement ou la personne a dormi. L'hote recoit chez lui et se rend chez
 * l'invite : chacun note donc le logement de l'autre.
 */
function logementSejourne(exchange: {
  hostId: string;
  homeId: string;
  guestHomeId: string | null;
}, userId: string): string | null {
  return exchange.hostId === userId ? exchange.guestHomeId : exchange.homeId;
}

@Injectable()
export class ListStaysToReviewUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string): Promise<StayToReview[]> {
    const sejours = await this.prisma.exchange.findMany({
      where: {
        status: 'PAST',
        OR: [{ hostId: userId }, { guestId: userId }],
        // Aucun avis de cette personne sur ce sejour.
        reviews: { none: { authorId: userId } },
      },
      orderBy: { endDate: 'desc' },
      include: {
        home: { include: { photos: { orderBy: { position: 'asc' }, take: 1 } } },
        guestHome: {
          include: { photos: { orderBy: { position: 'asc' }, take: 1 } },
        },
      },
    });

    // L'echange porte les identifiants des deux personnes sans relation
    // declaree : leurs prenoms se lisent en une requete a part.
    const partenaires = await this.prisma.user.findMany({
      where: {
        id: {
          in: sejours.map((sejour) =>
            sejour.hostId === userId ? sejour.guestId : sejour.hostId,
          ),
        },
      },
      select: { id: true, firstName: true },
    });

    const prenoms = new Map(
      partenaires.map((personne) => [personne.id, personne.firstName ?? '']),
    );

    return sejours
      .map((sejour) => {
        const estHote = sejour.hostId === userId;

        const logement = estHote ? sejour.guestHome : sejour.home;

        // Un echange sans logement en retour ne se note pas : l'hote n'a
        // sejourne nulle part.
        if (!logement) return null;

        return {
          exchangeId: sejour.id,
          homeId: logement.id,
          homeTitle: logement.title,
          homePhotoUrl: logement.photos[0]?.url ?? null,
          partnerFirstName:
            prenoms.get(estHote ? sejour.guestId : sejour.hostId) ?? '',
          startDate: sejour.startDate.toISOString(),
          endDate: sejour.endDate.toISOString(),
        };
      })
      .filter((sejour): sejour is StayToReview => sejour !== null);
  }

  /** Un sejour non note suffit a bloquer un nouvel echange. */
  async hasPendingReview(userId: string): Promise<boolean> {
    const compte = await this.prisma.exchange.count({
      where: {
        status: 'PAST',
        OR: [{ hostId: userId }, { guestId: userId }],
        reviews: { none: { authorId: userId } },
        // Meme condition que ci-dessus : sans logement sejourne, rien a noter.
        NOT: [
          { hostId: userId, guestHomeId: null },
        ],
      },
    });

    return compte > 0;
  }
}

@Injectable()
export class ReviewStayUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    exchangeId: string,
    userId: string,
    score: number,
    comment: string,
  ): Promise<{ id: string }> {
    const sejour = await this.prisma.exchange.findUnique({
      where: { id: exchangeId },
      select: {
        id: true,
        status: true,
        hostId: true,
        guestId: true,
        homeId: true,
        guestHomeId: true,
      },
    });

    if (!sejour) throw new NotFoundException('Séjour introuvable.');

    if (sejour.hostId !== userId && sejour.guestId !== userId) {
      throw new ForbiddenException("Ce séjour ne vous concerne pas.");
    }

    if (sejour.status !== 'PAST') {
      throw new BadRequestException(
        'Un séjour ne se note qu’une fois terminé.',
      );
    }

    if (!Number.isInteger(score) || score < NOTE_MIN || score > NOTE_MAX) {
      throw new BadRequestException('La note doit aller de 1 à 5.');
    }

    const propre = comment.trim();

    // Le commentaire est obligatoire : une note seule n'apprend rien a qui
    // lira l'avis.
    if (propre.length < COMMENTAIRE_MIN) {
      throw new BadRequestException(
        `Le commentaire doit faire au moins ${COMMENTAIRE_MIN} caractères.`,
      );
    }

    if (propre.length > COMMENTAIRE_MAX) {
      throw new BadRequestException(
        `Le commentaire ne peut pas dépasser ${COMMENTAIRE_MAX} caractères.`,
      );
    }

    if (isOffensive(propre)) {
      throw new BadRequestException(
        'Ce commentaire contient des propos injurieux. Reformulez-le.',
      );
    }

    const homeId = logementSejourne(sejour, userId);

    if (!homeId) {
      throw new BadRequestException(
        "Ce séjour n'a pas de logement à noter.",
      );
    }

    const existant = await this.prisma.review.findFirst({
      where: { exchangeId, authorId: userId },
      select: { id: true },
    });

    if (existant) {
      throw new BadRequestException('Ce séjour a déjà été noté.');
    }

    const avis = await this.prisma.review.create({
      data: { exchangeId, homeId, authorId: userId, score, comment: propre },
      select: { id: true },
    });

    await this.rafraichirMoyenne(homeId);

    return avis;
  }

  /**
   * La moyenne et le nombre d'avis sont stockes sur le logement : les
   * recalculer a chaque lecture couterait une agregation par carte affichee.
   */
  private async rafraichirMoyenne(homeId: string): Promise<void> {
    const resultat = await this.prisma.review.aggregate({
      where: { homeId },
      _avg: { score: true },
      _count: { _all: true },
    });

    await this.prisma.home.update({
      where: { id: homeId },
      data: {
        averageRating:
          resultat._avg.score !== null
            ? Math.round(resultat._avg.score * 10) / 10
            : null,
        reviewsCount: resultat._count._all,
      },
    });
  }
}
