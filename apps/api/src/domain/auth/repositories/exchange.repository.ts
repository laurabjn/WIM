import type { Exchange, PendingExchange } from '@wim/shared';

export interface ExchangeRepository {
  findMine(userId: string): Promise<Exchange[]>;
  findActiveBetween(
    firstUserId: string,
    secondUserId: string,
  ): Promise<PendingExchange | null>;
  // viewerId sert a savoir de quel cote se place le lecteur : sans lui,
  // isHost vaut faux pour tout le monde.
  findById(
    exchangeId: string,
    viewerId?: string,
  ): Promise<PendingExchange | null>;
  updateStatus(
    exchangeId: string,
    status: string,
    viewerId?: string,
  ): Promise<PendingExchange>;
  updateDates(
    exchangeId: string,
    startDate: Date,
    endDate: Date,
    viewerId?: string,
  ): Promise<PendingExchange>;
}