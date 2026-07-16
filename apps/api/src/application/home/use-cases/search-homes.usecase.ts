import { SearchHomesFilters } from "src/domain/auth/entities/search-home.entity";
import { HomeSearchRepository } from "src/domain/auth/repositories/home-search.repository";

export class SearchHomesUseCase {
  constructor(private readonly homeSearchRepository: HomeSearchRepository) {}

  async execute(filters: SearchHomesFilters) {
    return this.homeSearchRepository.search(filters);
  }
}