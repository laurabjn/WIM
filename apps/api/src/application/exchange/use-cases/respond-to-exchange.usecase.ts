import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import type { PendingExchange } from '@wim/shared';

import { ExchangeRepository } from 'src/domain/auth/repositories/exchange.repository';
import { EXCHANGE_REPOSITORY } from 'src/interfaces/http/tokens/token';
import { ListStaysToReviewUseCase } from './review-stay.usecase';

export type ExchangeResponse = 'ACCEPT' | 'DECLINE';

@Injectable()
export class RespondToExchangeUseCase {
  constructor(
    @Inject(EXCHANGE_REPOSITORY)
    private readonly exchangeRepository: ExchangeRepository,
    private readonly staysToReview: ListStaysToReviewUseCase,
  ) {}

  async execute(
    exchangeId: string,
    userId: string,
    response: ExchangeResponse,
    guestHomeId?: string,
  ): Promise<PendingExchange> {
    const exchange = await this.exchangeRepository.findById(exchangeId, userId);

    if (!exchange) {
      throw new NotFoundException('Échange introuvable.');
    }

    if (exchange.hostId !== userId && exchange.guestId !== userId) {
      throw new ForbiddenException("Cet échange ne vous concerne pas.");
    }

    if (exchange.status !== 'PENDING') {
      throw new BadRequestException(
        'Cet échange a déjà reçu une réponse.',
      );
    }

    if (response === 'ACCEPT' && exchange.hostId !== userId) {
      throw new ForbiddenException(
        "Seule la personne qui recoit la demande peut l'accepter.",
      );
    }

    if (
      response === 'ACCEPT' &&
      (await this.staysToReview.hasPendingReview(userId))
    ) {
      throw new BadRequestException(
        'Notez votre dernier séjour avant d’accepter un nouvel échange.',
      );
    }

    const logementRecu =
      response === 'ACCEPT'
        ? await this.choisirLogementRecu(exchangeId, guestHomeId)
        : undefined;

    const startDate = new Date(exchange.startDate);
    const now = new Date();

    const nextStatus =
      response === 'DECLINE'
        ? 'DECLINED'
        : startDate > now
          ? 'FUTURE'
          : 'CURRENT';

    return this.exchangeRepository.updateStatus(
      exchangeId,
      nextStatus,
      userId,
      logementRecu,
    );
  }

  private async choisirLogementRecu(
    exchangeId: string,
    choix?: string,
  ): Promise<string | null> {
    const logements = await this.exchangeRepository.findGuestHomes(exchangeId);

    if (choix) {
      if (!logements.some((logement) => logement.id === choix)) {
        throw new BadRequestException(
          "Ce logement n'appartient pas a la personne qui demande l'echange.",
        );
      }

      return choix;
    }

    if (logements.length === 1) return logements[0].id;

    if (logements.length > 1) {
      throw new BadRequestException(
        'Choisissez le logement que vous recevrez en echange.',
      );
    }

    return null;
  }
}

@Injectable()
export class CancelExchangeUseCase {
  constructor(
    @Inject(EXCHANGE_REPOSITORY)
    private readonly exchangeRepository: ExchangeRepository,
  ) {}

  async execute(
    exchangeId: string,
    userId: string,
  ): Promise<PendingExchange> {
    const exchange = await this.exchangeRepository.findById(exchangeId, userId);

    if (!exchange) {
      throw new NotFoundException('Échange introuvable.');
    }

    if (exchange.hostId !== userId && exchange.guestId !== userId) {
      throw new ForbiddenException('Cet échange ne vous concerne pas.');
    }

    // Un sejour passe appartient a l'historique des deux personnes : l'annuler
    // reecrirait ce qui a eu lieu. Seul ce qui n'a pas encore eu lieu, ou court
    // encore, peut etre annule.
    const annulable = ['PENDING', 'FUTURE', 'CURRENT'];

    if (!annulable.includes(exchange.status)) {
      throw new BadRequestException(
        'Cet échange ne peut plus être annulé.',
      );
    }

    return this.exchangeRepository.updateStatus(exchangeId, 'CANCELLED', userId);
  }
}

@Injectable()
export class UpdateExchangeDatesUseCase {
  constructor(
    @Inject(EXCHANGE_REPOSITORY)
    private readonly exchangeRepository: ExchangeRepository,
  ) {}

  async execute(
    exchangeId: string,
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<PendingExchange> {
    const exchange = await this.exchangeRepository.findById(exchangeId, userId);

    if (!exchange) {
      throw new NotFoundException('Échange introuvable.');
    }

    if (exchange.hostId !== userId && exchange.guestId !== userId) {
      throw new ForbiddenException("Cet échange ne vous concerne pas.");
    }

    if (exchange.status !== 'PENDING') {
      throw new BadRequestException(
        'Les dates ne peuvent plus être modifiées.',
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new BadRequestException('Dates invalides.');
    }

    if (end <= start) {
      throw new BadRequestException(
        'La date de fin doit suivre la date de début.',
      );
    }

    return this.exchangeRepository.updateDates(exchangeId, start, end, userId);
  }
}

@Injectable()
export class ListGuestHomesUseCase {
  constructor(
    @Inject(EXCHANGE_REPOSITORY)
    private readonly exchangeRepository: ExchangeRepository,
  ) {}

  async execute(
    exchangeId: string,
    userId: string,
  ): Promise<{ id: string; title: string; imageUrl: string | null }[]> {
    const exchange = await this.exchangeRepository.findById(exchangeId, userId);

    if (!exchange) {
      throw new NotFoundException('Échange introuvable.');
    }

    if (exchange.hostId !== userId) {
      throw new ForbiddenException(
        "Seule la personne qui recoit la demande consulte ces logements.",
      );
    }

    return this.exchangeRepository.findGuestHomes(exchangeId);
  }
}
