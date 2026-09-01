import type { Exchange, PendingExchange } from '@wim/shared';

export interface ExchangeRepository {
  findMine(userId: string): Promise<Exchange[]>;
  findActiveBetween(
    firstUserId: string,
    secondUserId: string,
  ): Promise<PendingExchange | null>;
  findById(
    exchangeId: string,
    viewerId?: string,
  ): Promise<PendingExchange | null>;
  updateStatus(
    exchangeId: string,
    status: string,
    viewerId?: string,
    guestHomeId?: string | null,
  ): Promise<PendingExchange>;
  findGuestHomes(
    exchangeId: string,
  ): Promise<{ id: string; title: string; imageUrl: string | null }[]>;
  updateDates(
    exchangeId: string,
    startDate: Date,
    endDate: Date,
    viewerId?: string,
  ): Promise<PendingExchange>;
}