import type { Exchange, PendingExchange } from '@wim/shared';

export interface ExchangeRepository {
  findMine(userId: string): Promise<Exchange[]>;
  findActiveBetween(
    firstUserId: string,
    secondUserId: string,
  ): Promise<PendingExchange | null>;
  findById(exchangeId: string): Promise<PendingExchange | null>;
  updateStatus(exchangeId: string, status: string): Promise<PendingExchange>;
  updateDates(
    exchangeId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<PendingExchange>;
}