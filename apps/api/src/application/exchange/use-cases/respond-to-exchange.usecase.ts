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

export type ExchangeResponse = 'ACCEPT' | 'DECLINE';

@Injectable()
export class RespondToExchangeUseCase {
  constructor(
    @Inject(EXCHANGE_REPOSITORY)
    private readonly exchangeRepository: ExchangeRepository,
  ) {}

  async execute(
    exchangeId: string,
    userId: string,
    response: ExchangeResponse,
  ): Promise<PendingExchange> {
    const exchange = await this.exchangeRepository.findById(exchangeId);

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

    const startDate = new Date(exchange.startDate);
    const now = new Date();

    const nextStatus =
      response === 'DECLINE'
        ? 'DECLINED'
        : startDate > now
          ? 'FUTURE'
          : 'CURRENT';

    return this.exchangeRepository.updateStatus(exchangeId, nextStatus);
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
    const exchange = await this.exchangeRepository.findById(exchangeId);

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

    return this.exchangeRepository.updateDates(exchangeId, start, end);
  }
}
