import { HomeEntity } from "../entities/home.entity";

export interface FavoriteRepository {
  add(userId: string, homeId: string): Promise<void>;
  remove(userId: string, homeId: string): Promise<void>;
  listByUser(userId: string): Promise<HomeEntity[]>;
}