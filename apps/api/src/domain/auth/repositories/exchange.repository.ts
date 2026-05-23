import type { Exchange } from '@wim/shared';

export interface ExchangeRepository {
  findMine(userId: string): Promise<Exchange[]>;
}