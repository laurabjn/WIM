import { SearchHomesFilters } from "../entities/search-home.entity";

export interface HomeSearchRepository {
  search(filters: SearchHomesFilters): Promise<unknown[]>;
}