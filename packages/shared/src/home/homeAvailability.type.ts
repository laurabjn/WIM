export type AvailabilityType = 'AVAILABLE' | 'BLOCKED';

export type HomeAvailability = {
  id: string;
  homeId: string;
  startDate: string;
  endDate: string;
  type: AvailabilityType;
  createdAt: string;
  updatedAt: string;
};

export type CreateHomeAvailabilityPayload = {
  startDate: string;
  endDate: string;
  type: AvailabilityType;
};