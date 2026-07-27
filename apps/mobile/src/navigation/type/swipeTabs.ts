import { Home } from '@wim/shared/home/home.type';

export type SwipeStackParamList = {
  Swipe: 
    | {
        restoreHomeId?: string;
        restoreIndex?: number;
      }
    | undefined;

  SwipeHomeDetails: {
    homeId: string;
    swipeIndex: number;
  };
};