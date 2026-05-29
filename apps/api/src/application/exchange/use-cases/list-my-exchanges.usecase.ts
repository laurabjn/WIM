import { ExchangeRepository } from "src/domain/auth/repositories/exchange.repository";

export class ListMyExchangesUseCase {
  constructor(private readonly exchangeRepository: ExchangeRepository) {}

  async execute(userId: string) {
    return this.exchangeRepository.findMine(userId);
  }
}