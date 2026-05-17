import { AvailabilityType, HomeAvailabilityEntity } from "src/domain/auth/entities/home-availability.entity";


export type CreateHomeAvailabilityInput = {
  homeId: string;
  startDate: Date;
  endDate: Date;
  type: AvailabilityType;
};

export interface HomeAvailabilityRepository {
  create(input: CreateHomeAvailabilityInput): Promise<HomeAvailabilityEntity>;

  findByHomeId(homeId: string): Promise<HomeAvailabilityEntity[]>;

  findOverlapping(params: {
    homeId: string;
    startDate: Date;
    endDate: Date;
  }): Promise<HomeAvailabilityEntity[]>;

  delete(params: {
    availabilityId: string;
    homeId: string;
  }): Promise<void>;
}