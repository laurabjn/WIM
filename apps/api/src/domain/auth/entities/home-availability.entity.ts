export type AvailabilityType = 'AVAILABLE' | 'BLOCKED';

export type HomeAvailabilityEntity = {
  id: string;
  homeId: string;
  startDate: Date;
  endDate: Date;
  type: AvailabilityType;
  createdAt: Date;
  updatedAt: Date;
};