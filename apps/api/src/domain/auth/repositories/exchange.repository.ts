import type { Exchange, PendingExchange } from '@wim/shared';

export interface ExchangeRepository {
  findMine(userId: string): Promise<Exchange[]>;
  findPendingBetween(
    firstUserId: string,
    secondUserId: string,
  ): Promise<PendingExchange | null>;
  findById(exchangeId: string): Promise<PendingExchange | null>;
  updateStatus(exchangeId: string, status: string): Promise<PendingExchange>;
}