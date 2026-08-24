import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { isOffensive } from 'src/application/moderation/offensive-language';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { HomeRatingService } from '../services/home-rating.service';

const NOTE_MIN = 1;
const NOTE_MAX = 5;
const COMMENTAIRE_MIN = 10;
const COMMENTAIRE_MAX = 1000;
const REPONSE_MAX = 1000;

const AUTEUR = {
  select: { id: true, firstName: true, avatarUrl: true, createdAt: true },
};

export type ReviewView = {
  id: string;
  score: number;
  comment: string;
  createdAt: string;
  reply: string | null;
  replyAt: string | null;
  homeId: string;
  homeTitle: string;
  author: {
    id: string;
    firstName: string | null;
    avatarUrl: string | null;
  };
};

function versVue(avis: any): ReviewView {
  return {
    id: avis.id,
    score: avis.score,
    comment: avis.comment,
    createdAt: avis.createdAt.toISOString(),
    reply: avis.reply ?? null,
    replyAt: avis.replyAt ? avis.replyAt.toISOString() : null,
    homeId: avis.homeId,
    homeTitle: avis.home?.title ?? '',
    author: {
      id: avis.author.id,
      firstName: avis.author.firstName,
      avatarUrl: avis.author.avatarUrl,
    },
  };
}

function verifierCommentaire(comment: string): string {
  const propre = comment.trim();

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

  return propre;
}

@Injectable()
export class UpdateReviewUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rating: HomeRatingService,
  ) {}

  async execute(
    reviewId: string,
    userId: string,
    score: number,
    comment: string,
  ): Promise<ReviewView> {
    const avis = await this.prisma.review.findUnique({
      where: { id: reviewId },
      select: { id: true, authorId: true, homeId: true },
    });

    if (!avis) throw new NotFoundException('Avis introuvable.');

    if (avis.authorId !== userId) {
      throw new ForbiddenException("Cet avis n'est pas le vôtre.");
    }

    if (!Number.isInteger(score) || score < NOTE_MIN || score > NOTE_MAX) {
      throw new BadRequestException('La note doit aller de 1 à 5.');
    }

    const propre = verifierCommentaire(comment);

    const modifie = await this.prisma.review.update({
      where: { id: reviewId },
      data: { score, comment: propre },
      include: { author: AUTEUR, home: { select: { title: true } } },
    });

    await this.rating.recalculer(avis.homeId);

    return versVue(modifie);
  }
}

@Injectable()
export class DeleteReviewUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rating: HomeRatingService,
  ) {}

  async execute(reviewId: string, userId: string): Promise<void> {
    const avis = await this.prisma.review.findUnique({
      where: { id: reviewId },
      select: { id: true, authorId: true, homeId: true },
    });

    if (!avis) throw new NotFoundException('Avis introuvable.');

    if (avis.authorId !== userId) {
      throw new ForbiddenException("Cet avis n'est pas le vôtre.");
    }

    await this.prisma.review.delete({ where: { id: reviewId } });

    await this.rating.recalculer(avis.homeId);
  }
}

@Injectable()
export class ReplyToReviewUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    reviewId: string,
    userId: string,
    reply: string,
  ): Promise<ReviewView> {
    const avis = await this.prisma.review.findUnique({
      where: { id: reviewId },
      include: { home: { select: { ownerId: true, title: true } } },
    });

    if (!avis) throw new NotFoundException('Avis introuvable.');

    if (avis.home.ownerId !== userId) {
      throw new ForbiddenException(
        'Seul le propriétaire du logement peut répondre.',
      );
    }

    const propre = reply.trim();

    if (!propre) {
      throw new BadRequestException('La réponse ne peut pas être vide.');
    }

    if (propre.length > REPONSE_MAX) {
      throw new BadRequestException(
        `La réponse ne peut pas dépasser ${REPONSE_MAX} caractères.`,
      );
    }

    if (isOffensive(propre)) {
      throw new BadRequestException(
        'Cette réponse contient des propos injurieux. Reformulez-la.',
      );
    }

    const modifie = await this.prisma.review.update({
      where: { id: reviewId },
      data: { reply: propre, replyAt: new Date() },
      include: { author: AUTEUR, home: { select: { title: true } } },
    });

    return versVue(modifie);
  }
}

@Injectable()
export class ReportReviewUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    reviewId: string,
    reporterId: string,
    reason: string,
  ): Promise<{ id: string }> {
    const avis = await this.prisma.review.findUnique({
      where: { id: reviewId },
      select: { id: true, authorId: true, comment: true },
    });

    if (!avis) throw new NotFoundException('Avis introuvable.');

    if (avis.authorId === reporterId) {
      throw new BadRequestException(
        'Vous ne pouvez pas signaler votre propre avis.',
      );
    }

    if (!reason?.trim()) {
      throw new BadRequestException('Un motif est requis.');
    }

    return this.prisma.userReport.create({
      data: {
        reporterId,
        reportedId: avis.authorId,
        reviewId,
        reason: reason.trim(),
        message: avis.comment.slice(0, 500),
      },
      select: { id: true },
    });
  }
}
