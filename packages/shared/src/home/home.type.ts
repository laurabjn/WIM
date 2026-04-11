export interface Home {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  city: string;
  country: string;
  capacity: number;
  homeType: string;
  amenities: string[];
  carExchangeAccepted: boolean;
  photos: HomePhoto[];
  createdAt: string;
  updatedAt: string;
}

export interface HomePhoto {
  id: string;
  homeId: string;
  url: string;
  position: number;
}

export interface CreateHomeInput {
  title: string;
  description: string;
  city: string;
  country: string;
  capacity: number;
  homeType: string;
  amenities: string[];
  carExchangeAccepted: boolean;
}

export interface UpdateHomeInput extends Partial<CreateHomeInput> {}